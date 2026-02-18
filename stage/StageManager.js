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

    async go(name, params) {
      const next = this.registry.get(name);
      if (!next) throw new Error(`Stage '${name}' is not registered`);
      if (this.currentStageName === name && this.currentStage) return this.currentStage;

      const previous = this.currentStage;
      if (previous) previous.exit();

      if (!next.loaded) await next.load(params);
      next.enter(params);

      this.currentStageName = name;
      this.currentStage = next;
      return next;
    }

    async goWithTransition(fromName, transitionName, toName, params) {
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

      this.currentStageName = toName;
      this.currentStage = to;
      return to;
    }
  }

  global.icefishStages = global.icefishStages || {};
  global.icefishStages.StageManager = StageManager;
})(window);
