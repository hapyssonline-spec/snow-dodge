(() => {
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const rand = (min, max) => min + Math.random() * (max - min);
  const nowMs = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

  class AudioManager {
    constructor() {
      this.ctx = null;
      this.ready = false;
      this.unlocked = false;
      this.muted = false;
      this.sfxVolume = 0.35;
      this.musicVolume = 0.35;
      this.manifest = {};
      this.activeLoops = new Map();
      this.lastPlay = new Map();
      this.noiseBuffer = null;
    }

    get isReady() {
      return this.ready;
    }

    get isUnlocked() {
      return this.unlocked;
    }

    get isMuted() {
      return this.muted;
    }

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const Context = window.AudioContext || window.webkitAudioContext;
        this.ctx = new Context();
      }
      if (this.ctx) {
        this.ready = true;
      }
    }

    unlock() {
      if (this.unlocked) return;
      this.unlocked = true;
      if (this.ctx?.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
    }

    load(manifest) {
      this.manifest = manifest || {};
      this.ready = true;
      return Promise.resolve();
    }

    play(name, options = {}) {
      if (this.muted || !this.unlocked || !this.ctx) return null;
      const entry = this.manifest?.[name];
      if (!entry) {
        console.warn(`[AudioManager] Unknown sound: ${name}`);
        return null;
      }
      const cooldownMs = this.getCooldownMs(options, entry);
      if (cooldownMs) {
        const last = this.lastPlay.get(name) || 0;
        const now = nowMs();
        if (now - last < cooldownMs) return null;
        this.lastPlay.set(name, now);
      }

      const baseVolume = clamp(options.volume ?? entry.volume ?? 1, 0, 1);
      const volume = clamp(baseVolume * this.sfxVolume, 0, 1);
      if (volume <= 0) return null;

      const loop = options.loop ?? entry.loop;
      const loopId = options.loopId || name;
      const rate = clamp(options.rate ?? entry.rate ?? 1, 0.25, 4);
      const pitchMultiplier = this.getPitchMultiplier(options.pitchRange ?? entry.pitchRange);
      const pitch = clamp(rate * pitchMultiplier, 0.5, 2.5);
      const variant = this.pickVariant(entry, options);

      if (loop) {
        const existing = this.activeLoops.get(loopId);
        if (existing) return existing;
      }

      const handle = this.playSynth(variant, {
        name,
        loop: !!loop,
        loopId,
        volume,
        baseVolume,
        pitch,
        fadeInMs: options.fadeInMs
      });
      if (loop && handle) {
        this.activeLoops.set(loopId, handle);
      }
      return handle;
    }

    stopLoop(loopId, fadeMs = 0) {
      const handle = this.activeLoops.get(loopId);
      if (!handle) return;
      this.activeLoops.delete(loopId);
      handle.stop?.(fadeMs);
    }

    setSfxVolume(value) {
      this.sfxVolume = clamp(value, 0, 1);
      this.activeLoops.forEach((handle) => {
        const base = handle.baseVolume ?? 1;
        const volume = clamp(base * this.sfxVolume, 0, 1);
        handle.gain?.gain && (handle.gain.gain.value = volume);
      });
    }

    setMusicVolume(value) {
      this.musicVolume = clamp(value, 0, 1);
    }

    setMuted(state) {
      this.muted = !!state;
      if (this.muted) {
        Array.from(this.activeLoops.keys()).forEach((loopId) => this.stopLoop(loopId, 80));
      }
    }

    toggleMute() {
      this.setMuted(!this.muted);
      return this.muted;
    }

    getCooldownMs(options, entry) {
      if (typeof options.cooldownMs === "number") return options.cooldownMs;
      if (Array.isArray(options.cooldownRangeMs)) {
        return rand(options.cooldownRangeMs[0], options.cooldownRangeMs[1]);
      }
      if (typeof entry?.cooldownMs === "number") return entry.cooldownMs;
      if (Array.isArray(entry?.cooldownRangeMs)) {
        return rand(entry.cooldownRangeMs[0], entry.cooldownRangeMs[1]);
      }
      return 0;
    }

    getPitchMultiplier(range) {
      if (Array.isArray(range)) {
        const spread = rand(range[0], range[1]);
        return 1 + (Math.random() < 0.5 ? -spread : spread);
      }
      if (typeof range === "number") {
        return 1 + rand(-range, range);
      }
      return 1;
    }

    pickVariant(entry, options) {
      if (options.variant) return options.variant;
      if (Array.isArray(entry?.variants) && entry.variants.length) {
        return entry.variants[Math.floor(Math.random() * entry.variants.length)];
      }
      if (entry?.synth) {
        return { type: entry.synth, ...entry };
      }
      return entry;
    }

    ensureNoiseBuffer() {
      if (this.noiseBuffer || !this.ctx) return;
      const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buffer;
    }

    playSynth(synth, options) {
      if (!this.ctx) return null;
      const ctx = this.ctx;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      this.ensureNoiseBuffer();
      const t0 = ctx.currentTime;
      const gainNode = ctx.createGain();
      const targetVolume = Math.max(0.0001, options.volume);
      gainNode.gain.value = options.loop && options.fadeInMs ? 0.0001 : targetVolume;
      gainNode.connect(ctx.destination);

      const fadeIn = options.fadeInMs ? options.fadeInMs / 1000 : 0;
      if (options.loop && fadeIn > 0) {
        gainNode.gain.setValueAtTime(0.0001, t0);
        gainNode.gain.exponentialRampToValueAtTime(targetVolume, t0 + fadeIn);
      }

      const stopAt = (sources, when) => {
        sources.forEach((source) => {
          if (!source) return;
          try {
            source.stop(when);
          } catch {}
        });
      };

      const handle = {
        name: options.name,
        loopId: options.loopId,
        gain: gainNode,
        baseVolume: options.baseVolume,
        stop: (fadeMs = 0) => {
          const fade = Math.max(0, fadeMs / 1000);
          const stopTime = ctx.currentTime + fade;
          if (fade > 0) {
            gainNode.gain.cancelScheduledValues(ctx.currentTime);
            gainNode.gain.setValueAtTime(gainNode.gain.value || 0.0001, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, stopTime);
          }
          stopAt(handle.sources || [], stopTime + 0.02);
        }
      };

      const sources = [];
      const connectSource = (source, node = gainNode) => {
        if (!source) return;
        source.connect(node);
        sources.push(source);
      };

      const synthType = synth?.type || "click";
      const pitch = options.pitch || 1;

      if (synthType === "click") {
        const osc = ctx.createOscillator();
        osc.type = synth.wave || "square";
        const freq = (synth.freq || 900) * pitch;
        osc.frequency.setValueAtTime(freq, t0);
        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(1, t0);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, t0 + (synth.decay || 0.05));
        osc.connect(oscGain);
        oscGain.connect(gainNode);
        sources.push(osc);

        const noiseAmount = synth.noise ?? 0.2;
        if (noiseAmount > 0 && this.noiseBuffer) {
          const noise = ctx.createBufferSource();
          noise.buffer = this.noiseBuffer;
          const filter = ctx.createBiquadFilter();
          filter.type = "highpass";
          filter.frequency.setValueAtTime((synth.filter || 1200) * pitch, t0);
          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(noiseAmount, t0);
          noiseGain.gain.exponentialRampToValueAtTime(0.0001, t0 + (synth.decay || 0.05));
          noise.connect(filter);
          filter.connect(noiseGain);
          noiseGain.connect(gainNode);
          sources.push(noise);
        }
        const end = t0 + (synth.decay || 0.05) + 0.02;
        osc.start(t0);
        osc.stop(end);
        if (sources.length > 1) {
          sources.slice(1).forEach((source) => {
            source.start(t0);
            source.stop(end);
          });
        }
      } else if (synthType === "sweep") {
        const osc = ctx.createOscillator();
        osc.type = synth.wave || "triangle";
        const start = (synth.start || 300) * pitch;
        const end = (synth.end || 1400) * pitch;
        const duration = synth.duration || 0.18;
        osc.frequency.setValueAtTime(start, t0);
        osc.frequency.exponentialRampToValueAtTime(end, t0 + duration);
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t0);
        env.gain.exponentialRampToValueAtTime(1, t0 + 0.02);
        env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
        osc.connect(env);
        env.connect(gainNode);
        osc.start(t0);
        osc.stop(t0 + duration + 0.02);
        sources.push(osc);
      } else if (synthType === "whoosh") {
        const noise = ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        const start = (synth.start || 260) * pitch;
        const end = (synth.end || 1100) * pitch;
        const duration = synth.duration || 0.35;
        filter.frequency.setValueAtTime(start, t0);
        filter.frequency.exponentialRampToValueAtTime(end, t0 + duration);
        filter.Q.value = synth.q || 0.7;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t0);
        env.gain.exponentialRampToValueAtTime(1, t0 + 0.05);
        env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
        noise.connect(filter);
        filter.connect(env);
        env.connect(gainNode);
        noise.start(t0);
        noise.stop(t0 + duration + 0.02);
        sources.push(noise);
      } else if (synthType === "reel_loop") {
        const noise = ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        noise.loop = true;
        noise.playbackRate.value = pitch;
        const lowpass = ctx.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.setValueAtTime((synth.lowpass || 900) * pitch, t0);
        const highpass = ctx.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.setValueAtTime(synth.highpass || 80, t0);
        const noiseGain = ctx.createGain();
        noiseGain.gain.value = synth.noiseGain ?? 0.6;
        noise.connect(lowpass);
        lowpass.connect(highpass);
        highpass.connect(noiseGain);
        noiseGain.connect(gainNode);
        noise.start(t0);
        sources.push(noise);

        const hum = ctx.createOscillator();
        hum.type = "sine";
        hum.frequency.setValueAtTime((synth.humFreq || 110) * pitch, t0);
        const humGain = ctx.createGain();
        humGain.gain.value = synth.humGain ?? 0.2;
        hum.connect(humGain);
        humGain.connect(gainNode);
        hum.start(t0);
        sources.push(hum);
      } else if (synthType === "splash") {
        const noise = ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.setValueAtTime((synth.filter || 500) * pitch, t0);
        const env = ctx.createGain();
        const duration = synth.duration || 0.28;
        env.gain.setValueAtTime(0.0001, t0);
        env.gain.exponentialRampToValueAtTime(1, t0 + 0.02);
        env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
        noise.connect(filter);
        filter.connect(env);
        env.connect(gainNode);
        noise.start(t0);
        noise.stop(t0 + duration + 0.02);
        sources.push(noise);

        const thump = ctx.createOscillator();
        thump.type = "sine";
        thump.frequency.setValueAtTime((synth.thump || 180) * pitch, t0);
        const thumpGain = ctx.createGain();
        thumpGain.gain.setValueAtTime(0.6, t0);
        thumpGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.2);
        thump.connect(thumpGain);
        thumpGain.connect(gainNode);
        thump.start(t0);
        thump.stop(t0 + 0.22);
        sources.push(thump);
      } else if (synthType === "coin") {
        const notes = synth.notes || [1200, 1600, 2000];
        const interval = synth.interval || 0.035;
        const duration = synth.duration || 0.1;
        notes.forEach((note, index) => {
          const osc = ctx.createOscillator();
          osc.type = synth.wave || "triangle";
          osc.frequency.setValueAtTime(note * pitch, t0 + index * interval);
          const env = ctx.createGain();
          env.gain.setValueAtTime(0.0001, t0 + index * interval);
          env.gain.exponentialRampToValueAtTime(1, t0 + index * interval + 0.01);
          env.gain.exponentialRampToValueAtTime(0.0001, t0 + index * interval + duration);
          osc.connect(env);
          env.connect(gainNode);
          osc.start(t0 + index * interval);
          osc.stop(t0 + index * interval + duration + 0.02);
          sources.push(osc);
        });
      } else if (synthType === "cash") {
        const osc = ctx.createOscillator();
        osc.type = synth.wave || "square";
        const start = (synth.start || 800) * pitch;
        const end = (synth.end || 500) * pitch;
        const duration = synth.duration || 0.2;
        osc.frequency.setValueAtTime(start, t0);
        osc.frequency.exponentialRampToValueAtTime(end, t0 + duration);
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t0);
        env.gain.exponentialRampToValueAtTime(1, t0 + 0.02);
        env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
        osc.connect(env);
        env.connect(gainNode);
        osc.start(t0);
        osc.stop(t0 + duration + 0.02);
        sources.push(osc);
      } else if (synthType === "chime") {
        const notes = synth.notes || [600, 900, 1200];
        const interval = synth.interval || 0.05;
        const duration = synth.duration || 0.25;
        notes.forEach((note, index) => {
          const osc = ctx.createOscillator();
          osc.type = synth.wave || "sine";
          osc.frequency.setValueAtTime(note * pitch, t0 + index * interval);
          const env = ctx.createGain();
          env.gain.setValueAtTime(0.0001, t0 + index * interval);
          env.gain.exponentialRampToValueAtTime(1, t0 + index * interval + 0.02);
          env.gain.exponentialRampToValueAtTime(0.0001, t0 + index * interval + duration);
          osc.connect(env);
          env.connect(gainNode);
          osc.start(t0 + index * interval);
          osc.stop(t0 + index * interval + duration + 0.02);
          sources.push(osc);
        });
      }

      handle.sources = sources;
      return handle;
    }
  }

  window.AudioManager = AudioManager;
  window.audioManager = new AudioManager();
})();
