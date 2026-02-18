(function initStageBase(global) {
  class StageBase {
    constructor({ name, rootId = null, rootEl = null } = {}) {
      this.name = name || "unnamed";
      this.root = rootEl || (rootId ? document.getElementById(rootId) : null);
      this.loaded = false;
      this.active = false;
      this.mounted = Boolean(this.root && this.root.isConnected);

      this.timers = new Set();
      this.intervals = new Set();
      this.listeners = [];
      this.aborters = new Set();
      this.rafId = null;
      this._rafTick = null;
    }

    async load() {
      this.loaded = true;
      this.mount();
    }

    enter() {
      this.active = true;
      this.setVisible(true);
      this.mount();
    }

    exit() {
      this.active = false;
      this.stopRaf();
      this.clearTimers();
      this.clearIntervals();
      this.offAll();
      this.abortAll();
      this.setVisible(false);
      this.debugResources("exit");
    }

    async unload() {
      this.exit();
      this.unmount();
      this.loaded = false;
      this.root = this.root || null;
    }

    on(el, event, handler, options) {
      if (!el || !el.addEventListener) return () => {};
      el.addEventListener(event, handler, options);
      this.listeners.push({ el, event, handler, options });
      return () => {
        el.removeEventListener(event, handler, options);
      };
    }

    offAll() {
      for (const { el, event, handler, options } of this.listeners) {
        el.removeEventListener(event, handler, options);
      }
      this.listeners.length = 0;
    }

    setTimeout(fn, delay, ...args) {
      const id = window.setTimeout(() => {
        this.timers.delete(id);
        fn(...args);
      }, delay);
      this.timers.add(id);
      return id;
    }

    setInterval(fn, delay, ...args) {
      const id = window.setInterval(fn, delay, ...args);
      this.intervals.add(id);
      return id;
    }

    clearTimeout(id) {
      if (!id) return;
      window.clearTimeout(id);
      this.timers.delete(id);
    }

    clearInterval(id) {
      if (!id) return;
      window.clearInterval(id);
      this.intervals.delete(id);
    }

    clearTimers() {
      for (const id of this.timers) window.clearTimeout(id);
      this.timers.clear();
    }

    clearIntervals() {
      for (const id of this.intervals) window.clearInterval(id);
      this.intervals.clear();
    }

    startRaf(tick) {
      this.stopRaf();
      this._rafTick = (ts) => {
        if (!this.active) return;
        tick(ts);
        this.rafId = window.requestAnimationFrame(this._rafTick);
      };
      this.rafId = window.requestAnimationFrame(this._rafTick);
    }

    stopRaf() {
      if (this.rafId != null) {
        window.cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      this._rafTick = null;
    }

    createAbortController() {
      const controller = new AbortController();
      this.aborters.add(controller);
      return controller;
    }

    releaseAborter(controller) {
      this.aborters.delete(controller);
    }

    abortAll() {
      for (const controller of this.aborters) {
        try {
          controller.abort();
        } catch (_) {}
      }
      this.aborters.clear();
    }

    setVisible(visible) {
      if (!this.root) return;
      this.root.classList.toggle("is-hidden", !visible);
      this.root.style.display = visible ? "" : "none";
      this.root.style.pointerEvents = visible ? "" : "none";
      this.root.setAttribute("aria-hidden", visible ? "false" : "true");
    }

    mount() {
      if (!this.root) return;
      if (!this.root.isConnected) {
        const parent = document.getElementById("app") || document.body;
        parent.appendChild(this.root);
      }
      this.mounted = true;
    }

    unmount() {
      if (!this.root || !this.root.parentNode) return;
      this.root.parentNode.removeChild(this.root);
      this.mounted = false;
    }

    debugResources(action) {
      if (!global.__ICEFISH_DEV__) return;
      console.info(
        `[Stage:${this.name}] ${action}: listeners=${this.listeners.length}, timers=${this.timers.size}, intervals=${this.intervals.size}, raf=${this.rafId ? 1 : 0}, aborters=${this.aborters.size}`
      );
    }
  }

  global.icefishStages = global.icefishStages || {};
  global.icefishStages.StageBase = StageBase;
})(window);
