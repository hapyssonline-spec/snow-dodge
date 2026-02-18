(function initStageManager(global) {
  class StageManager {
    constructor() {
      this.registry = new Map();
      this.currentStageName = null;
      this.currentStage = null;
    }

    register(name, stageInstance) {
      if (!name || !stageInstance) {
        throw new Error("StageManager.register(name, stageInstance) requires both arguments");
      }
      this.registry.set(name, stageInstance);
      return stageInstance;
    }

    get(name) {
      return this.registry.get(name);
    }

    async go(name, params = {}, options = {}) {
      const next = this.registry.get(name);
      if (!next) throw new Error(`Stage '${name}' is not registered`);

      const shouldReuseCurrent = this.currentStageName === name
        && this.currentStage
        && !options.force
        && Object.keys(params || {}).length === 0;
      if (shouldReuseCurrent) return this.currentStage;

      const previous = this.currentStage;
      if (previous) {
        previous.exit();
        if (global.__ICEFISH_DEV__) {
          console.info(`[StageManager] exited '${this.currentStageName}'`);
        }
      }

      if (!next.loaded) await next.load(params);
      next.enter(params);

      if (global.__ICEFISH_DEV__) {
        console.info(`[StageManager] entered '${name}'`);
      }

      this.currentStageName = name;
      this.currentStage = next;
      return next;
    }

    async goWithTransition(fromName, transitionName, toName, params = {}) {
      const from = this.registry.get(fromName);
      const transition = this.registry.get(transitionName);
      const to = this.registry.get(toName);
      if (!transition || !to) {
        throw new Error("Transition and destination stages must be registered");
      }

      if (from) from.exit();
      if (!transition.loaded) await transition.load(params);
      transition.enter(params);

      if (!to.loaded) await to.load(params);

      transition.exit();
      to.enter(params);

      if (global.__ICEFISH_DEV__) {
        console.info(`[StageManager] transition '${fromName}' -> '${transitionName}' -> '${toName}'`);
      }

      this.currentStageName = toName;
      this.currentStage = to;
      return to;
    }
  }

  global.icefishStages = global.icefishStages || {};
  global.icefishStages.StageManager = StageManager;
})(window);
