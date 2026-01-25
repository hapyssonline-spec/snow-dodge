(() => {
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const rand = (min, max) => min + Math.random() * (max - min);
  const nowMs = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

  class AudioManager {
    constructor() {
      this.ctx = null;
      this.useWebAudio = false;
      this.ready = false;
      this.unlocked = false;
      this.muted = false;
      this.sfxVolume = 0.35;
      this.musicVolume = 0.35;
      this.manifest = {};
      this.buffers = new Map();
      this.fallbackPools = new Map();
      this.activeLoops = new Map();
      this.lastPlay = new Map();
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
      this.useWebAudio = !!(window.AudioContext || window.webkitAudioContext);
      if (this.useWebAudio && !this.ctx) {
        const Context = window.AudioContext || window.webkitAudioContext;
        this.ctx = new Context();
      }
    }

    unlock() {
      if (this.unlocked) return;
      this.unlocked = true;
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      if (!this.useWebAudio) {
        const silent = new Audio();
        silent.volume = 0;
        silent.play().catch(() => {});
      }
    }

    getSupportedExtension(exts) {
      const test = document.createElement("audio");
      for (const ext of exts) {
        const type = ext === "mp3" ? "audio/mpeg" : `audio/${ext}`;
        if (test.canPlayType(type)) return ext;
      }
      return null;
    }

    load(manifest) {
      this.manifest = manifest || {};
      const entries = Object.entries(this.manifest);
      const tasks = entries.map(([name, entry]) => this.loadEntry(name, entry));
      return Promise.all(tasks)
        .then(() => {
          this.ready = true;
        })
        .catch(() => {
          this.ready = true;
        });
    }

    loadEntry(name, entry) {
      const files = entry?.files || [];
      if (!files.length) {
        console.warn(`[AudioManager] No files configured for ${name}`);
        this.buffers.set(name, []);
        this.fallbackPools.set(name, []);
        return Promise.resolve();
      }
      if (this.useWebAudio && this.ctx) {
        return Promise.all(files.map((file) => this.loadBuffer(file)))
          .then((buffers) => {
            const valid = buffers.filter(Boolean);
            if (!valid.length) {
              console.warn(`[AudioManager] Failed to load buffers for ${name}`);
            }
            this.buffers.set(name, valid);
          })
          .catch(() => {
            console.warn(`[AudioManager] Failed to load ${name}`);
            this.buffers.set(name, []);
          });
      }

      const audios = files.map((file) => {
        const audio = new Audio();
        audio.src = file;
        audio.preload = "auto";
        audio.load();
        audio.addEventListener("error", () => {
          console.warn(`[AudioManager] Missing audio file: ${file}`);
        });
        return audio;
      });
      this.fallbackPools.set(name, audios);
      return Promise.resolve();
    }

    loadBuffer(file) {
      return fetch(file)
        .then((res) => {
          if (!res.ok) throw new Error("Fetch failed");
          return res.arrayBuffer();
        })
        .then((data) => this.ctx.decodeAudioData(data))
        .catch(() => {
          console.warn(`[AudioManager] Missing audio file: ${file}`);
          return null;
        });
    }

    play(name, options = {}) {
      if (this.muted || !this.unlocked) return null;
      const entry = this.manifest?.[name];
      if (!entry) {
        console.warn(`[AudioManager] Unknown sound: ${name}`);
        return null;
      }
      const cooldownMs = options.cooldownMs ?? entry.cooldownMs;
      if (cooldownMs) {
        const last = this.lastPlay.get(name) || 0;
        const now = nowMs();
        if (now - last < cooldownMs) return null;
        this.lastPlay.set(name, now);
      }

      const volume = clamp((options.volume ?? entry.volume ?? 1) * this.sfxVolume, 0, 1);
      if (volume <= 0) return null;

      const loop = options.loop ?? entry.loop;
      const loopId = options.loopId || name;
      const rate = clamp(options.rate ?? entry.rate ?? 1, 0.25, 4);
      const pitchRange = options.pitchRange ?? entry.pitchRange;
      const playbackRate = pitchRange ? clamp(rate * rand(1 - pitchRange, 1 + pitchRange), 0.5, 2) : rate;

      if (this.useWebAudio && this.ctx) {
        const buffers = this.buffers.get(name) || [];
        if (!buffers.length) {
          console.warn(`[AudioManager] No loaded buffers for ${name}`);
          return null;
        }
        const buffer = buffers[Math.floor(Math.random() * buffers.length)];
        if (!buffer) return null;

        if (loop) {
          const existing = this.activeLoops.get(loopId);
          if (existing) return existing;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = !!loop;
        source.playbackRate.value = playbackRate;

        const gainNode = this.ctx.createGain();
        gainNode.gain.value = volume;
        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        if (loop) {
          const fadeIn = options.fadeInMs ? options.fadeInMs / 1000 : 0;
          if (fadeIn > 0) {
            const t0 = this.ctx.currentTime;
            gainNode.gain.setValueAtTime(0.0001, t0);
            gainNode.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), t0 + fadeIn);
          }
          const handle = { source, gain: gainNode, volume, loopId, name };
          this.activeLoops.set(loopId, handle);
          source.onended = () => {
            this.activeLoops.delete(loopId);
          };
          source.start(0);
          return handle;
        }

        try {
          source.start(0);
        } catch {
          return null;
        }
        return { source, gain: gainNode };
      }

      const pool = this.fallbackPools.get(name) || [];
      if (!pool.length) {
        console.warn(`[AudioManager] No fallback audio for ${name}`);
        return null;
      }

      if (loop) {
        const existing = this.activeLoops.get(loopId);
        if (existing) return existing;
        const audio = pool[Math.floor(Math.random() * pool.length)].cloneNode(true);
        audio.loop = true;
        audio.volume = volume;
        audio.playbackRate = playbackRate;
        audio.play().catch(() => {});
        const handle = { audio, volume, loopId, name };
        this.activeLoops.set(loopId, handle);
        return handle;
      }

      const audio = pool[Math.floor(Math.random() * pool.length)].cloneNode(true);
      audio.volume = volume;
      audio.playbackRate = playbackRate;
      audio.play().catch(() => {});
      return { audio };
    }

    stopLoop(loopId, fadeMs = 0) {
      const handle = this.activeLoops.get(loopId);
      if (!handle) return;
      this.activeLoops.delete(loopId);
      if (handle.source && this.ctx) {
        const fade = Math.max(0, fadeMs / 1000);
        if (fade > 0 && handle.gain) {
          const t0 = this.ctx.currentTime;
          handle.gain.gain.cancelScheduledValues(t0);
          handle.gain.gain.setValueAtTime(handle.gain.gain.value, t0);
          handle.gain.gain.exponentialRampToValueAtTime(0.0001, t0 + fade);
          try {
            handle.source.stop(t0 + fade + 0.01);
          } catch {
            handle.source.stop();
          }
          return;
        }
        try {
          handle.source.stop();
        } catch {}
        return;
      }

      if (handle.audio) {
        const audio = handle.audio;
        if (fadeMs > 0) {
          const startVolume = audio.volume;
          audio.volume = 0;
          setTimeout(() => {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = startVolume;
          }, fadeMs);
        } else {
          audio.pause();
          audio.currentTime = 0;
        }
      }
    }

    setSfxVolume(value) {
      this.sfxVolume = clamp(value, 0, 1);
      this.activeLoops.forEach((handle) => {
        const entry = this.manifest?.[handle.name];
        const base = entry?.volume ?? 1;
        const volume = clamp(base * this.sfxVolume, 0, 1);
        if (handle.gain) {
          handle.gain.gain.value = volume;
        } else if (handle.audio) {
          handle.audio.volume = volume;
        }
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
  }

  window.AudioManager = AudioManager;
  window.audioManager = new AudioManager();
})();
