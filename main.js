(() => {
  const isUi = (t) => t && t.closest && t.closest("#controls, .controls, .hud, button, a, input, textarea, select");
  const inScene = (t) => t && t.closest && (t.closest("#sceneRoot") || t.id === "game" || t.closest("#lakeScene"));
  const kill = (e) => {
    if (!inScene(e.target) || isUi(e.target)) return;
    e.preventDefault();
  };
  document.addEventListener("selectstart", kill, { passive: false });
  document.addEventListener("dragstart", kill, { passive: false });
  document.addEventListener("contextmenu", kill, { passive: false });
  document.addEventListener("mousedown", kill, { passive: false });
})();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistration().then((reg) => {
    if (reg) reg.update();
  });
}

(() => {
  "use strict";

  // ===== DOM =====
  const app = document.getElementById("app");
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d", { alpha: true });
  const lakeScene = document.getElementById("lakeScene");
  const rodLayer = document.getElementById("rodLayer");
  const bobberLayer = document.getElementById("bobberLayer");

  const coinsEl = document.getElementById("coins");
  const fishEl = document.getElementById("fish");
  const playerLevelEl = document.getElementById("playerLevel");
  const xpTextEl = document.getElementById("xpText");
  const xpBarFill = document.getElementById("xpBarFill");
  const hintToast = document.getElementById("hintToast");

  const overlay = document.getElementById("overlay");
  const ovText = document.getElementById("ovText");
  const btnPlay = document.getElementById("btnPlay");
  const btnReset = document.getElementById("btnReset");
  const btnMute = document.getElementById("btnMute");
  const btnProgress = document.getElementById("btnProgress");
  const btnInventory = document.getElementById("btnInventory");
  const btnJournal = document.getElementById("btnJournal");
  const btnCity = document.getElementById("btnCity");

  const invOverlay = document.getElementById("invOverlay");
  const btnInvClose = document.getElementById("btnInvClose");
  const invSort = document.getElementById("invSort");
  const invList = document.getElementById("invList");
  const invEmpty = document.getElementById("invEmpty");

  const trashOverlay = document.getElementById("trashOverlay");
  const btnTrashClose = document.getElementById("btnTrashClose");
  const trashGrid = document.getElementById("trashGrid");
  const trashRewardStatus = document.getElementById("trashRewardStatus");
  const btnTrashFill = document.getElementById("btnTrashFill");
  const btnResetCharges = document.getElementById("btnResetCharges");

  const catchOverlay = document.getElementById("catchOverlay");
  const catchTitle = document.getElementById("catchTitle");
  const catchName = document.getElementById("catchName");
  const catchRarity = document.getElementById("catchRarity");
  const catchWeight = document.getElementById("catchWeight");
  const catchStory = document.getElementById("catchStory");
  const catchFullPrice = document.getElementById("catchFullPrice");
  const catchDiscountPrice = document.getElementById("catchDiscountPrice");
  const catchTrophyWrap = document.getElementById("catchTrophyWrap");
  const catchTrophyToggle = document.getElementById("catchTrophyToggle");
  const btnCatchKeep = document.getElementById("btnCatchKeep");
  const btnCatchSellNow = document.getElementById("btnCatchSellNow");

  const travelHud = document.getElementById("travelHud");
  const travelTimer = document.getElementById("travelTimer");

  const cityHud = document.getElementById("cityHud");
  const btnBackToLake = document.getElementById("btnBackToLake");

  const shopOverlay = document.getElementById("shopOverlay");
  const shopTitle = document.getElementById("shopTitle");
  const btnShopClose = document.getElementById("btnShopClose");
  const shopStats = document.getElementById("shopStats");
  const shopInventory = document.getElementById("shopInventory");
  const shopInvList = document.getElementById("shopInvList");
  const shopInvEmpty = document.getElementById("shopInvEmpty");
  const shopOffer = document.getElementById("shopOffer");
  const shopOfferInfo = document.getElementById("shopOfferInfo");
  const haggleSelect = document.getElementById("haggleSelect");
  const discountSelect = document.getElementById("discountSelect");
  const btnHaggle = document.getElementById("btnHaggle");
  const btnSellOffer = document.getElementById("btnSellOffer");
  const shopOfferNote = document.getElementById("shopOfferNote");
  const gearShopSection = document.getElementById("gearShopSection");
  const baitList = document.getElementById("baitList");
  const rodList = document.getElementById("rodList");
  const lineList = document.getElementById("lineList");
  const questList = document.getElementById("questList");
  const btnNewQuest = document.getElementById("btnNewQuest");
  const progressOverlay = document.getElementById("progressOverlay");
  const btnProgressClose = document.getElementById("btnProgressClose");

  const sceneFade = document.getElementById("sceneFade");
  const toast = document.getElementById("toast");
  const xpToast = document.getElementById("xpToast");
  const bottomBar = document.getElementById("bottombar");
  const topBar = document.getElementById("topbar");
  const fightHud = document.getElementById("fightHud");
  const tensionFill = fightHud?.querySelector(".tensionFill");
  const tensionMarker = fightHud?.querySelector(".tensionMarker");
  const reelFill = fightHud?.querySelector(".reelFill");
  const reelPercent = fightHud?.querySelector(".reelPercent");
  const breakHint = document.getElementById("breakHint");
  const fishHintText = document.getElementById("fishHintText");
  const rareBoostHud = document.getElementById("rareBoostHud");

  // ===== Helpers =====
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const CAUGHT_SPECIES_KEY = "caughtSpeciesSet";

  let reducedEffects = false;
  const effectsLevel = {
    reduced: false,
    reason: ""
  };

  function applyReducedEffects(enabled, reason = "") {
    reducedEffects = enabled;
    effectsLevel.reduced = enabled;
    effectsLevel.reason = reason;
    if (app) {
      app.dataset.effects = enabled ? "reduced" : "full";
    }
  }

  const motionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  if (motionQuery?.matches) {
    applyReducedEffects(true, "prefers-reduced-motion");
  } else {
    applyReducedEffects(false, "default");
  }
  motionQuery?.addEventListener?.("change", (event) => {
    applyReducedEffects(event.matches, "prefers-reduced-motion");
  });

  function readCaughtSpecies() {
    try {
      const raw = localStorage.getItem(CAUGHT_SPECIES_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Set();
    }
  }

  function writeCaughtSpecies(set) {
    try {
      localStorage.setItem(CAUGHT_SPECIES_KEY, JSON.stringify(Array.from(set)));
    } catch {}
  }

  function getTensionZone(tension) {
    const zones = game.reel?.zones;
    if (!zones) return "SLACK";
    if (tension <= 0.10) return "SLACK";
    if (tension < zones.sweetMin) return "YELLOW";
    if (tension <= zones.sweetMax) return "GREEN";
    if (tension < zones.dangerMin) return "RED";
    return "DANGER";
  }

  function getTapProgressGain(zone, need) {
    switch (zone) {
      case "GREEN":
        return 0.10 * need;
      case "YELLOW":
        return 0.04 * need;
      case "RED":
        return 0.02 * need;
      case "DANGER":
        return 0.01 * need;
      default:
        return 0;
    }
  }

  const formatKg = (value) => `${value.toFixed(2)} кг`;
  const formatCoins = (value) => `${value} монет`;
  const formatPercent = (value) => `${Math.round(value)}%`;
  const formatDayKey = (value) => {
    const date = value ? new Date(value) : new Date();
    return date.toISOString().slice(0, 10);
  };

  let fightHudVisible = false;
  let fightHudHideTimer = null;
  let revealHintHideTimer = null;
  let lastFishHintText = null;
  let hintHideTimer = null;
  let castHintCount = 0;
  let idleHintShown = false;

  function setFightHudVisible(visible) {
    if (!fightHud) return;
    if (fightHudVisible === visible) return;
    fightHudVisible = visible;
    fightHud.setAttribute("aria-hidden", visible ? "false" : "true");
    if (bottomBar) bottomBar.classList.toggle("bottombar-fight", visible);
    if (topBar) topBar.classList.toggle("topbar-fight", visible);
    if (visible) {
      if (fightHudHideTimer) window.clearTimeout(fightHudHideTimer);
      fightHud.classList.remove("hidden");
      requestAnimationFrame(() => {
        fightHud.classList.add("is-visible");
      });
      return;
    }
    fightHud.classList.remove("is-visible");
    if (fightHudHideTimer) window.clearTimeout(fightHudHideTimer);
    fightHudHideTimer = window.setTimeout(() => {
      if (!fightHudVisible) fightHud.classList.add("hidden");
    }, 220);
  }

  function setTension(value) {
    if (!tensionFill || !tensionMarker) return;
    const pct = clamp(value, 0, 1) * 100;
    tensionFill.style.width = `${pct}%`;
    tensionMarker.style.left = `${pct}%`;
  }

  function setReelProgress(value) {
    if (!reelFill || !reelPercent) return;
    const pct = clamp(value, 0, 1) * 100;
    reelFill.style.width = `${pct}%`;
    reelPercent.textContent = `${Math.round(pct)}%`;
    const barWidth = reelFill.parentElement?.clientWidth ?? 0;
    const fillWidth = Math.max(0, (barWidth - 4) * (pct / 100));
    reelFill.classList.toggle("reelFill--head", fillWidth >= 12);
  }

  function setSlip(percent) {
    if (!breakHint) return;
    const pct = clamp(Math.round(percent), 0, 100);
    const nextText = `Срыв: ${pct}%`;
    if (breakHint.textContent !== nextText) {
      breakHint.textContent = nextText;
    }
  }

  function updateFightHud() {
    const inFight = game.mode === "REELING";
    setFightHudVisible(inFight);
    if (!inFight) return;
    const line = getLineStats();
    const tensionNormalized = clamp(game.tension / line.breakThreshold, 0, 1);
    const progressNormalized = clamp(game.progress / game.need, 0, 1);
    const slipPercent = (game.reel?.slackRisk || 0) * 100;
    setTension(tensionNormalized);
    setReelProgress(progressNormalized);
    setSlip(slipPercent);
  }

  class RevealSystem {
    constructor(options) {
      this.fishTable = options.fishTable;
      this.confusionGroups = options.confusionGroups;
      this.rarityRank = options.rarityRank;
      this.devMode = options.devMode;
      this.reset();
    }

    reset() {
      this.active = false;
      this.weightKg = 0;
      this.rarity = "common";
      this.speciesId = null;
      this.maxProgress = 0;
      this.weightStage = -1;
      this.speciesStage = -1;
      this.weightText = null;
      this.speciesText = null;
      this.realSpecies = null;
      this.mateSpecies = null;
      this.firstCandidate = null;
      this.secondCandidate = null;
      this.rareSecondCandidate = null;
      this.isRarePlus = false;
      this.startWidth = null;
      this.minWidth = null;
      this.candidates = null;
      this.weightRange = null;
      this.lastWeightRange = null;
      this.wPrev = null;
    }

    startAttempt(fish) {
      if (!fish) return;
      this.active = true;
      this.weightKg = fish.weightKg || 0;
      this.rarity = fish.rarity || "common";
      this.speciesId = fish.speciesId || null;
      this.maxProgress = 0;
      this.weightStage = -1;
      this.speciesStage = -1;
      this.weightText = null;
      this.speciesText = null;
      this.weightRange = null;
      this.lastWeightRange = null;
      this.wPrev = null;
      this.startWidth = clamp(4 + this.weightKg * 0.45, 4, 8);
      this.minWidth = clamp(1.0 + Math.sqrt(this.weightKg) * 0.08, 1.0, 1.6);
      const species = this.fishTable.find((entry) => entry.id === this.speciesId);
      this.realSpecies = fish.speciesName || fish.name || species?.name || "Неизвестно";
      this.mateSpecies = this.pickMateFromConfusionGroups(this.speciesId);
      const realFirst = Math.random() < 0.5;
      this.firstCandidate = realFirst ? this.realSpecies : this.mateSpecies;
      this.secondCandidate = realFirst ? this.mateSpecies : this.realSpecies;
      this.rareSecondCandidate = Math.random() < 0.5 ? this.firstCandidate : this.secondCandidate;
      this.isRarePlus = (this.rarityRank[this.rarity] ?? 0) >= this.rarityRank.rare;
    }

    update(progress) {
      if (!this.active) return;
      this.maxProgress = Math.max(this.maxProgress, progress);

      const nextWeightStage = this.maxProgress >= 0.3 ? Math.floor((this.maxProgress - 0.3) / 0.05) : -1;
      if (nextWeightStage > this.weightStage) {
        let currentStage = this.weightStage;
        while (currentStage < nextWeightStage) {
          currentStage += 1;
          const prevRange = this.weightRange;
          this.updateWeightRange();
          this.logWeightStage(currentStage, this.weightRange, prevRange);
        }
        this.weightStage = nextWeightStage;
        this.weightText = this.weightRange ? this.formatWeightText(this.weightRange) : null;
      }

      let nextSpeciesStage = -1;
      if (this.maxProgress >= 0.8) {
        nextSpeciesStage = 2;
      } else if (this.maxProgress >= 0.6) {
        nextSpeciesStage = 1;
      }
      if (nextSpeciesStage > this.speciesStage) {
        this.speciesStage = nextSpeciesStage;
        this.speciesText = this.buildSpeciesHint();
      }
    }

    getHint() {
      return {
        weightText: this.weightText,
        speciesText: this.speciesText
      };
    }

    buildSpeciesHint() {
      if (!this.speciesStage || !this.firstCandidate || !this.secondCandidate) return null;
      if (this.speciesStage === 1) {
        return this.isRarePlus
          ? `${this.firstCandidate} / ${this.secondCandidate} / ???`
          : `${this.firstCandidate} / ${this.secondCandidate}`;
      }
      if (this.speciesStage === 2) {
        return this.isRarePlus
          ? `??? / ${this.rareSecondCandidate}`
          : `${this.firstCandidate} / ${this.secondCandidate}`;
      }
      return null;
    }

    updateWeightRange() {
      const W = this.weightKg;
      const prevRange = this.weightRange;
      let low = null;
      let high = null;

      if (!prevRange) {
        const width = this.pickStartWidth();
        const lowMin = Math.max(0.1, W - width);
        const lowMax = Math.max(lowMin, W);
        low = rand(lowMin, lowMax);
        high = low + width;
      } else {
        const prevWidth = prevRange.high - prevRange.low;
        const width = this.pickNextWidth(prevWidth);
        const lowMin = Math.max(prevRange.low, W - width);
        const lowMax = Math.min(prevRange.high - width, W);
        if (lowMin <= lowMax) {
          low = rand(lowMin, lowMax);
        } else {
          low = clamp(W - width, prevRange.low, prevRange.high - width);
        }
        high = low + width;
      }

      const rounded = this.roundRange(low, high, W, prevRange);
      this.weightRange = rounded;
      this.lastWeightRange = rounded;
      this.wPrev = rounded.width;
      return rounded;
    }

    pickStartWidth() {
      const noisy = clamp(this.startWidth + rand(-0.3, 0.3), 4, 8);
      return noisy;
    }

    pickNextWidth(prevWidth) {
      const factor = rand(0.86, 0.93);
      const width = Math.max(this.minWidth, prevWidth * factor);
      return Math.min(width, prevWidth);
    }

    roundRange(low, high, weight, prevRange) {
      let lowOut = low + rand(-0.1, 0.1);
      let highOut = high + rand(-0.1, 0.1);
      const lowStep = Math.random() < 0.5 ? 0.2 : 0.3;
      const highStep = Math.random() < 0.5 ? 0.2 : 0.4;

      lowOut = this.roundDown(lowOut, lowStep);
      highOut = this.roundUp(highOut, highStep);

      lowOut = Math.max(0.1, lowOut);
      if (highOut < lowOut) highOut = lowOut;

      if (lowOut > weight) lowOut = weight;
      if (highOut < weight) highOut = weight;

      if (prevRange) {
        lowOut = Math.max(lowOut, prevRange.low);
        highOut = Math.min(highOut, prevRange.high);
        if (lowOut > weight) lowOut = weight;
        if (highOut < weight) highOut = weight;
      }

      lowOut = Math.max(0.1, lowOut);
      if (highOut < lowOut) highOut = lowOut;

      if (prevRange) {
        lowOut = clamp(lowOut, prevRange.low, prevRange.high);
        highOut = clamp(highOut, prevRange.low, prevRange.high);
        if (lowOut > weight) lowOut = weight;
        if (highOut < weight) highOut = weight;
        if (highOut < lowOut) highOut = lowOut;
      }

      return { low: lowOut, high: highOut, width: highOut - lowOut };
    }

    formatWeightText(range) {
      return `${range.low.toFixed(1)}–${range.high.toFixed(1)} кг`;
    }

    roundDown(value, step) {
      return Math.floor(value / step) * step;
    }

    roundUp(value, step) {
      return Math.ceil(value / step) * step;
    }

    pickMateFromConfusionGroups(realId) {
      const group = this.confusionGroups.find((list) => list.includes(realId));
      let secondaryId = null;
      if (group) {
        const options = group.filter((id) => id !== realId);
        secondaryId = options[Math.floor(Math.random() * options.length)] || null;
      }
      if (!secondaryId) {
        const commons = this.fishTable.filter((entry) => entry.rarity === "common" && entry.id !== realId);
        const fallback = commons[Math.floor(Math.random() * commons.length)];
        secondaryId = fallback?.id || realId;
      }
      const secondary = this.fishTable.find((entry) => entry.id === secondaryId)?.name;
      return secondary || this.realSpecies || "Неизвестно";
    }

    logWeightStage(stage, range, prevRange) {
      if (!this.devMode || !range) return;
      const prevWidth = prevRange ? prevRange.high - prevRange.low : null;
      const widthOk = prevWidth === null ? true : range.width <= prevWidth + 1e-6;
      const nestedOk = prevRange
        ? range.low >= prevRange.low - 1e-6 && range.high <= prevRange.high + 1e-6
        : true;
      const containsW = range.low - 1e-6 <= this.weightKg && this.weightKg <= range.high + 1e-6;
      console.log("[RevealSystem] stage update", {
        stage,
        L: Number(range.low.toFixed(3)),
        H: Number(range.high.toFixed(3)),
        width: Number(range.width.toFixed(3)),
        W: Number(this.weightKg.toFixed(3)),
        widthOk,
        nestedOk,
        containsW
      });
    }
  }

  function setVhVar() {
    document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
  }

  let lakeState = "idle";
  let bobberAnimation = null;
  let biteTimer = null;
  let strikeTimer = null;

  const debounce = (fn, delay = 100) => {
    let timer = null;
    return (...args) => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => fn(...args), delay);
    };
  };

  function applyLakeRig() {
    if (!lakeScene) return;
    lakeScene.classList.toggle("is-idle", lakeState === "idle");
    lakeScene.classList.toggle("is-fishing", ["fishing", "bite", "strike"].includes(lakeState));
    lakeScene.classList.toggle("is-bite", lakeState === "bite");
    lakeScene.classList.toggle("is-strike", lakeState === "strike");
  }

  function setLakeState(state) {
    lakeState = state;
    applyLakeRig();
  }

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      applyLakeRig();
    },
    { once: true }
  );

  function getRodTipPoint() {
    if (!rodLayer) return null;
    const rect = rodLayer.getBoundingClientRect();
    return {
      x: rect.right - rect.width * 0.22,
      y: rect.top + rect.height * 0.32
    };
  }

  function getCastPoint() {
    if (!lakeScene) return null;
    const rect = lakeScene.getBoundingClientRect();
    const rootStyle = getComputedStyle(document.documentElement);
    const castXValue = rootStyle.getPropertyValue("--cast-x").trim();
    const castYValue = rootStyle.getPropertyValue("--cast-y").trim();
    const parseCssLength = (value, size, fallbackPercent = 0.5) => {
      if (!value) return size * fallbackPercent;
      if (value.endsWith("%")) return (Number.parseFloat(value) / 100) * size;
      if (value.endsWith("px")) return Number.parseFloat(value);
      const numeric = Number.parseFloat(value);
      return Number.isNaN(numeric) ? size * fallbackPercent : numeric;
    };
    const castX = parseCssLength(castXValue, rect.width, 0.5);
    const castY = parseCssLength(castYValue, rect.height, 0.5);
    return {
      x: rect.left + castX,
      y: rect.top + castY
    };
  }

  function getBobberScale() {
    const scale = getComputedStyle(document.documentElement)
      .getPropertyValue("--bobber-scale")
      .trim();
    return Number.parseFloat(scale) || 1;
  }

  function placeBobberAt(x, y) {
    if (!bobberLayer) return;
    bobberLayer.style.left = `${x}px`;
    bobberLayer.style.top = `${y}px`;
  }

  function syncBobberToRodTip() {
    if (!bobberLayer) return;
    const rodTip = getRodTipPoint();
    if (!rodTip) return;
    bobber.x = rodTip.x;
    bobber.y = rodTip.y;
    placeBobberAt(rodTip.x, rodTip.y);
  }

  function animateCastToHole() {
    if (!bobberLayer) return;
    const rodTip = getRodTipPoint();
    const castPoint = getCastPoint();
    if (!rodTip || !castPoint) return;

    setLakeState("fishing");
    const scale = getBobberScale();
    const dx = rodTip.x - castPoint.x;
    const dy = rodTip.y - castPoint.y;

    if (bobberAnimation) bobberAnimation.cancel();
    bobberLayer.style.animation = "none";
    bobberLayer.style.transform = `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`;
    bobberAnimation = bobberLayer.animate(
      [
        { transform: `translate3d(${dx}px, ${dy}px, 0) scale(${scale})` },
        { transform: `translate3d(0px, 0px, 0) scale(${scale})` }
      ],
      { duration: 450, easing: "cubic-bezier(.2,.8,.2,1)" }
    );
    bobberAnimation.onfinish = () => {
      bobberLayer.style.transform = "";
      bobberLayer.style.animation = "";
    };
    bobberAnimation.oncancel = () => {
      bobberLayer.style.transform = "";
      bobberLayer.style.animation = "";
    };
  }

  function setFishing(active) {
    setLakeState(active ? "fishing" : "idle");
    if (!active && !bobber.visible) {
      syncBobberToRodTip();
    }
  }

  function triggerBite() {
    if (!lakeScene) return;
    if (biteTimer) window.clearTimeout(biteTimer);
    setLakeState("bite");
    if (!reducedEffects) {
      rippleBoostUntil = scene.t + 0.8;
      spawnRipple(1.3);
    }
    biteTimer = window.setTimeout(() => {
      if (game.mode === "BITE") {
        setLakeState("fishing");
      }
    }, Math.round(game.biteWindow * 1000));
  }

  function triggerStrike() {
    if (!lakeScene) return;
    if (strikeTimer) window.clearTimeout(strikeTimer);
    setLakeState("strike");
    strikeTimer = window.setTimeout(() => {
      if (game.mode === "BITE") {
        setLakeState("bite");
      } else if (["WAITING", "HOOKED", "REELING"].includes(game.mode)) {
        setLakeState("fishing");
      } else {
        setLakeState("idle");
      }
    }, 200);
  }

  function spawnRipple(strength = 1) {
    if (reducedEffects || !bobber.inWater) return;
    ripples.push({
      x: bobber.x,
      y: bobber.y + 6,
      r: 8,
      alpha: 0.28 * strength,
      maxR: 26 + 14 * strength,
      speed: 18 + 8 * strength
    });
  }

  function updateRipples(dt) {
    for (let i = ripples.length - 1; i >= 0; i -= 1) {
      const ripple = ripples[i];
      ripple.r += ripple.speed * dt;
      ripple.alpha -= dt * 0.25;
      if (ripple.r >= ripple.maxR || ripple.alpha <= 0.01) {
        ripples.splice(i, 1);
      }
    }
  }

  function triangular(min, mode, max) {
    const u = Math.random();
    const c = (mode - min) / (max - min);
    if (u <= c) {
      return min + Math.sqrt(u * (max - min) * (mode - min));
    }
    return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
  }

  function formatDate(value) {
    try {
      return new Date(value).toLocaleString("ru-RU", {
        dateStyle: "medium",
        timeStyle: "short"
      });
    } catch {
      return value;
    }
  }

  function makeId() {
    return `fish-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.remove("hidden");
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.classList.add("hidden"), 200);
    }, 1200);
  }

  function showXPGain(result) {
    if (!xpToast || !result) return;
    const lines = [
      `<span class="xpToastLine">+${result.gainedXP} XP</span>`,
      `<span class="xpToastLine">Ур. ${result.level} ${result.xp}/${result.xpToNext}</span>`
    ];
    if (result.leveledUp) {
      lines.push(`<span class="xpToastLine">Новый уровень: ${result.level}</span>`);
    }
    xpToast.innerHTML = lines.join("");
    xpToast.classList.remove("hidden");
    xpToast.classList.add("show");
    setTimeout(() => {
      xpToast.classList.remove("show");
      setTimeout(() => xpToast.classList.add("hidden"), 200);
    }, 1500);
  }

  // ===== Tension + progress balance (REELING) =====
  const TENSION_MAX = 1.32;
  const TAP_HISTORY = 6;
  const HINT_COOLDOWN = 0.5;
  const TELEGRAPH_PULSE = 0.25;
  const TENSION_RELAX_MULT = 4.5;
  const PROGRESS_DECAY_IDLE = 0.22;
  const PROGRESS_DECAY_ACTIVE = 0.05;
  const PROGRESS_DECAY_DANGER_BONUS = 0.12;

  const ROD_LENGTH_FACTOR = 0.13;
  const ROD_WIDTH = 3;

  const SCENE_LAKE = "SCENE_LAKE";
  const SCENE_CATCH_MODAL = "SCENE_CATCH_MODAL";
  const SCENE_TRAVEL = "SCENE_TRAVEL";
  const SCENE_CITY = "SCENE_CITY";
  const SCENE_BUILDING_FISHSHOP = "SCENE_BUILDING_FISHSHOP";
  const SCENE_BUILDING_TROPHY = "SCENE_BUILDING_TROPHY";
  const SCENE_BUILDING_GEARSHOP = "SCENE_BUILDING_GEARSHOP";

  // ===== Fish table =====
  const fishSpeciesTable = [
    {
      id: "roach",
      name: "Плотва",
      rarity: "common",
      chance: 0.3,
      minKg: 0.1,
      maxKg: 1.2,
      modeKg: 0.35,
      pricePerKg: 45,
      story: "Серебристая тень у кромки льда. Говорят, плотва первая проверяет приманку и первая же выдаёт рыбака.",
      minRodTier: 1
    },
    {
      id: "perch",
      name: "Окунь",
      rarity: "common",
      chance: 0.22,
      minKg: 0.15,
      maxKg: 2.0,
      modeKg: 0.6,
      pricePerKg: 55,
      story: "Полосатый разбойник. Часто идёт стаей и любит короткие резкие рывки.",
      minRodTier: 1
    },
    {
      id: "crucian",
      name: "Карась",
      rarity: "common",
      chance: 0.16,
      minKg: 0.2,
      maxKg: 3.5,
      modeKg: 1.0,
      pricePerKg: 50,
      story: "Упрямый и терпеливый. Старики говорят: карась клюёт тогда, когда ты уже почти ушёл.",
      minRodTier: 1
    },
    {
      id: "bream",
      name: "Лещ",
      rarity: "uncommon",
      chance: 0.09,
      minKg: 0.5,
      maxKg: 6.0,
      modeKg: 1.8,
      pricePerKg: 70,
      story: "Тяжёлый, ‘плоский’ и молчаливый. Вытаскивать его — как поднимать мокрую доску.",
      minRodTier: 1
    },
    {
      id: "pike",
      name: "Щука",
      rarity: "uncommon",
      chance: 0.12,
      minKg: 0.7,
      maxKg: 12.0,
      modeKg: 3.0,
      pricePerKg: 85,
      story: "Северная торпеда. Может стоять неподвижно минутами, а потом ударить как молния.",
      minRodTier: 1
    },
    {
      id: "zander",
      name: "Судак",
      rarity: "rare",
      chance: 0.06,
      minKg: 0.8,
      maxKg: 8.0,
      modeKg: 2.5,
      pricePerKg: 95,
      story: "Ночной охотник. У него холодный взгляд и характер — будто лёд под сапогом.",
      minRodTier: 2
    },
    {
      id: "trout",
      name: "Форель",
      rarity: "rare",
      chance: 0.03,
      minKg: 0.4,
      maxKg: 5.0,
      modeKg: 1.5,
      pricePerKg: 120,
      story: "Чистая вода, быстрые струи. Форель будто создана для побега — её надо ‘переиграть’.",
      minRodTier: 2
    },
    {
      id: "catfish",
      name: "Сом",
      rarity: "epic",
      chance: 0.015,
      minKg: 1.0,
      maxKg: 30.0,
      modeKg: 6.0,
      pricePerKg: 140,
      story: "Дно его дом. Если сом клюнул — ты почувствуешь, как будто за леску держится сама глубина.",
      minRodTier: 2
    },
    {
      id: "sturgeon",
      name: "Осётр",
      rarity: "epic",
      chance: 0.0045,
      minKg: 2.0,
      maxKg: 60.0,
      modeKg: 10.0,
      pricePerKg: 220,
      story: "Реликт прошлого. Осётр — рыба, которая помнит ‘до льда’, и не любит торопливых.",
      minRodTier: 3
    },
    {
      id: "moon-legend",
      name: "Белорыбица ‘Легенда Лунки’",
      rarity: "legendary",
      chance: 0.0005,
      minKg: 5.0,
      maxKg: 25.0,
      modeKg: 12.0,
      pricePerKg: 600,
      story: "Её видели единицы. Говорят, она выходит на свет луны и берёт приманку только у тех, кто умеет ждать.",
      minRodTier: 3
    }
  ];

  const confusionGroups = [
    ["roach", "crucian", "bream"],
    ["perch", "zander"],
    ["pike", "trout"],
    ["catfish", "sturgeon"]
  ];

  const rarityLabels = {
    common: "обычная",
    uncommon: "необычная",
    rare: "редкая",
    epic: "эпическая",
    legendary: "легендарная",
    trash: "мусор"
  };

  const rarityRank = {
    common: 0,
    uncommon: 1,
    rare: 2,
    epic: 3,
    legendary: 4,
    trash: 0
  };

  const rarityPower = {
    common: 0.0,
    uncommon: 0.05,
    rare: 0.1,
    epic: 0.16,
    legendary: 0.22
  };

  const queryParams = new URLSearchParams(window.location.search);
  const DEV_MODE = queryParams.has("dev");
  const DEV_TRASH_TEST = window.__DEV_TRASH_TEST__ === true
    || queryParams.get("dev") === "1"
    || queryParams.get("trashTest") === "1";
  const RARE_BOOST_MULT = DEV_TRASH_TEST ? 5.0 : 1.8;

  const revealSystem = new RevealSystem({
    fishTable: fishSpeciesTable,
    confusionGroups,
    rarityRank,
    devMode: DEV_MODE
  });

  function runRevealSimulation(attempts = 1000) {
    const mids = [];
    const weights = [];
    let outOfRange = 0;
    let widthIncreases = 0;

    for (let i = 0; i < attempts; i += 1) {
      const species = fishSpeciesTable[Math.floor(Math.random() * fishSpeciesTable.length)];
      const rawWeight = triangular(species.minKg, species.modeKg, species.maxKg);
      const weightKg = Math.round(clamp(rawWeight, species.minKg, species.maxKg) * 100) / 100;
      revealSystem.startAttempt({
        speciesId: species.id,
        rarity: species.rarity,
        weightKg
      });

      let prevWidth = null;
      for (let stage = 0; stage <= 14; stage += 1) {
        const p = 0.3 + stage * 0.05;
        revealSystem.update(p);
        const range = revealSystem.lastWeightRange;
        if (!range) continue;
        if (weightKg < range.low || weightKg > range.high) outOfRange += 1;
        if (prevWidth !== null && range.width > prevWidth + 1e-6) widthIncreases += 1;
        if (stage === 0) {
          mids.push((range.low + range.high) / 2);
          weights.push(weightKg);
        }
        prevWidth = range.width;
      }
    }

    const mean = (arr) => arr.reduce((sum, v) => sum + v, 0) / Math.max(1, arr.length);
    const meanMid = mean(mids);
    const meanW = mean(weights);
    let cov = 0;
    let varMid = 0;
    let varW = 0;
    for (let i = 0; i < mids.length; i += 1) {
      const dm = mids[i] - meanMid;
      const dw = weights[i] - meanW;
      cov += dm * dw;
      varMid += dm * dm;
      varW += dw * dw;
    }
    const corr = cov / Math.sqrt(Math.max(1e-6, varMid * varW));
    console.log("[RevealSystem] sim attempts:", attempts);
    console.log("[RevealSystem] correlation(mid, W) @30%:", Number.isFinite(corr) ? corr.toFixed(3) : "n/a");
    console.log("[RevealSystem] out of range count:", outOfRange);
    console.log("[RevealSystem] width increases count:", widthIncreases);
    revealSystem.reset();
  }

  if (DEV_MODE) {
    runRevealSimulation(1000);
    runSpeciesOrderSimulation(200);
  }

  function runSpeciesOrderSimulation(attempts = 200) {
    const pool = fishSpeciesTable.filter((species) => ["common", "uncommon"].includes(species.rarity));
    let realFirst = 0;
    let orderMismatch = 0;

    for (let i = 0; i < attempts; i += 1) {
      const species = pool[Math.floor(Math.random() * pool.length)];
      const weightKg = species.minKg;
      revealSystem.startAttempt({
        speciesId: species.id,
        rarity: species.rarity,
        weightKg,
        speciesName: species.name
      });

      if (revealSystem.firstCandidate === revealSystem.realSpecies) realFirst += 1;

      revealSystem.update(0.6);
      const stageOne = revealSystem.speciesText;
      revealSystem.update(0.8);
      const stageTwo = revealSystem.speciesText;

      const expected = `${revealSystem.firstCandidate} / ${revealSystem.secondCandidate}`;
      if (stageOne !== expected || stageTwo !== expected) orderMismatch += 1;
    }

    const ratio = realFirst / Math.max(1, attempts);
    console.log("[RevealSystem] species order attempts:", attempts);
    console.log("[RevealSystem] real first ratio:", ratio.toFixed(3));
    console.log("[RevealSystem] order mismatch count:", orderMismatch);
    revealSystem.reset();
  }

  const baitItems = [
    {
      id: "worm",
      name: "Червь",
      price: 18,
      boost: ["roach", "perch", "crucian"],
      note: "Любимый запах спокойной рыбы."
    },
    {
      id: "sweet-dough",
      name: "Сладкое тесто",
      price: 22,
      boost: ["crucian", "bream"],
      note: "Тягучая приманка для любителей лакомства."
    },
    {
      id: "minnow",
      name: "Малёк",
      price: 30,
      boost: ["pike", "zander"],
      note: "Хищники охотятся охотно."
    },
    {
      id: "spinner",
      name: "Блесна-вертушка",
      price: 36,
      boost: ["trout", "zander"],
      note: "Шумит и бликует в воде."
    },
    {
      id: "deep-lure",
      name: "Глубинная приманка",
      price: 48,
      boost: ["catfish", "sturgeon", "moon-legend"],
      note: "Для тех, кто ищет редкие виды."
    }
  ];

  const rodItems = [
    { id: 1, name: "Теплая палка", price: 0, repReq: 0, reelBonus: 0.0 },
    { id: 2, name: "Северный кивок", price: 280, repReq: 50, reelBonus: 0.04 },
    { id: 3, name: "Легендарная удочка", price: 680, repReq: 80, reelBonus: 0.08 }
  ];

  const lineItems = [
    { id: 1, name: "Леска 1X", price: 0, repReq: 0, breakThreshold: 1.0, maxKg: 4.5, tensionMult: 1.0 },
    { id: 2, name: "Леска 2X", price: 220, repReq: 50, breakThreshold: 1.12, maxKg: 9, tensionMult: 0.92 },
    { id: 3, name: "Леска 3X", price: 540, repReq: 75, breakThreshold: 1.22, maxKg: 18, tensionMult: 0.86 }
  ];

  const trashItems = [
    { id: "rusty_can", name: "Ржавая банка", weight: 1.0 },
    { id: "old_boot", name: "Старый ботинок", weight: 1.0 },
    { id: "broken_barrel", name: "Разбитая бочка", weight: 0.9 },
    { id: "torn_net", name: "Рваная сеть", weight: 0.9 },
    { id: "broken_reel", name: "Сломанная катушка", weight: 0.8 },
    { id: "bent_hook", name: "Погнутый крючок", weight: 0.8 },
    { id: "floating_plank", name: "Плавающая доска", weight: 0.9 },
    { id: "sealed_crate", name: "Запечатанный ящик", weight: 0.6 },
    { id: "old_extinguisher", name: "Старый огнетушитель", weight: 0.7 },
    { id: "rusty_key", name: "Ржавый ключ", weight: 0.2, weightDev: 1.0 }
  ];

  function getTrashChance() {
    return DEV_TRASH_TEST ? rand(0.7, 0.85) : rand(0.2, 0.25);
  }

  function getTrashWeight(item) {
    if (DEV_TRASH_TEST && Number.isFinite(item.weightDev)) return item.weightDev;
    return item.weight ?? 1;
  }

  function pickTrashItem(foundTrashMap) {
    const missing = trashItems.filter((item) => !foundTrashMap[item.id]);
    const pool = DEV_TRASH_TEST && missing.length ? missing : trashItems;
    const total = pool.reduce((sum, item) => sum + getTrashWeight(item), 0);
    let r = Math.random() * total;
    for (const item of pool) {
      r -= getTrashWeight(item);
      if (r <= 0) return item;
    }
    return pool[0];
  }

  function rollFish(rareBoostActive = false) {
    const bait = baitItems.find((item) => item.id === player.activeBaitId);
    const rollTable = fishSpeciesTable.map((fish) => {
      const rodAllowed = fish.minRodTier <= player.rodTier;
      if (!rodAllowed) return { fish, chance: 0 };
      let mult = 1.0;
      if (bait) {
        mult = bait.boost.includes(fish.id) ? 2.0 : 0.8;
      }
      if (rareBoostActive && (rarityRank[fish.rarity] ?? 0) >= rarityRank.rare) {
        mult *= RARE_BOOST_MULT;
      }
      return { fish, chance: fish.chance * mult };
    });

    const total = rollTable.reduce((sum, item) => sum + item.chance, 0);
    let r = Math.random() * total;
    for (const entry of rollTable) {
      r -= entry.chance;
      if (r <= 0 && entry.chance > 0) return entry.fish;
    }
    return rollTable.find((entry) => entry.chance > 0)?.fish || fishSpeciesTable[0];
  }

  function getActiveBaitLabel() {
    if (!player.activeBaitId) return "без приманки";
    const bait = baitItems.find((item) => item.id === player.activeBaitId);
    const count = player.baitInventory[player.activeBaitId] || 0;
    return bait ? `${bait.name} (${count})` : "без приманки";
  }

  function buildFishCatch(rareBoostActive = false) {
    const species = rollFish(rareBoostActive);
    const rawWeight = triangular(species.minKg, species.modeKg, species.maxKg);
    const weightKg = Math.round(clamp(rawWeight, species.minKg, species.maxKg) * 100) / 100;
    const sellValue = Math.round(weightKg * species.pricePerKg);
    const weightRatio = (weightKg - species.minKg) / (species.maxKg - species.minKg);
    const power = clamp(0.32 + weightRatio * 0.48 + (rarityPower[species.rarity] || 0), 0.25, 0.9);

    return {
      catchType: "fish",
      speciesId: species.id,
      name: species.name,
      rarity: species.rarity,
      rarityLabel: rarityLabels[species.rarity] || species.rarity,
      weightKg,
      pricePerKg: species.pricePerKg,
      sellValue,
      story: species.story,
      power
    };
  }

  function buildTrashCatch() {
    const item = pickTrashItem(foundTrash);
    const weightKg = Math.round(rand(0.2, 1.6) * 100) / 100;
    const power = clamp(0.24 + weightKg * 0.06, 0.22, 0.45);
    return {
      catchType: "trash",
      trashId: item.id,
      name: item.name,
      rarity: "trash",
      rarityLabel: rarityLabels.trash,
      weightKg,
      pricePerKg: 0,
      sellValue: 0,
      story: "",
      power
    };
  }

  function buildCatch() {
    const trashChance = getTrashChance();
    if (Math.random() < trashChance) {
      return buildTrashCatch();
    }
    return buildFishCatch(game.rareBoostActive);
  }

  const fishStateRanges = {
    CALM: { force: [-0.05, 0.02], duration: [1.2, 2.3] },
    REST: { force: [-0.12, -0.04], duration: [0.8, 1.6] },
    PULL: { force: [0.12, 0.22], duration: [0.6, 1.2] },
    DASH: { force: [0.26, 0.4], duration: [0.35, 0.75] },
    PANIC: { force: [0.18, 0.3], duration: [0.5, 1.0] }
  };

  function getRarityTuning(rarity) {
    switch (rarity) {
      case "legendary":
        return { dashBias: 1.45, telegraph: 0.72, duration: 0.78, force: 1.25 };
      case "epic":
        return { dashBias: 1.25, telegraph: 0.82, duration: 0.86, force: 1.15 };
      case "rare":
        return { dashBias: 1.12, telegraph: 0.92, duration: 0.94, force: 1.07 };
      case "uncommon":
        return { dashBias: 1.0, telegraph: 1.0, duration: 1.0, force: 1.0 };
      default:
        return { dashBias: 0.92, telegraph: 1.15, duration: 1.08, force: 0.92 };
    }
  }

  function getStateProgressMult(state) {
    if (state === "REST" || state === "CALM") return 1.15;
    if (state === "PULL") return 0.7;
    if (state === "DASH") return 0.35;
    if (state === "PANIC") return 0.55;
    return 1.0;
  }

  function getStateDuration(state, tune, fatigue = 0) {
    const range = fishStateRanges[state]?.duration || [0.8, 1.4];
    const base = rand(range[0], range[1]) * tune.duration;
    if (state === "PULL" || state === "DASH") return base * (1 - fatigue * 0.25);
    return base;
  }

  function getStateForceTarget(state, tune, powerScale, weightScale) {
    const range = fishStateRanges[state]?.force || [-0.04, 0.02];
    const base = rand(range[0], range[1]);
    const forceScale = (0.6 + powerScale * 0.9) * tune.force * weightScale;
    return base * forceScale;
  }

  function pickFishState(reel, tension, cadence) {
    const zones = reel.zones;
    const weights = {
      CALM: 0.28,
      REST: 0.2,
      PULL: 0.24,
      DASH: 0.15 * reel.fishAI.tune.dashBias,
      PANIC: 0.13 * reel.fishAI.tune.dashBias
    };

    const inSweet = tension >= zones.sweetMin && tension <= zones.sweetMax;
    if (tension < zones.safeMin) {
      weights.PULL += 0.12;
      weights.DASH += 0.1;
      weights.REST -= 0.08;
    }
    if (tension > zones.dangerMin) {
      weights.PANIC += 0.12;
      weights.DASH += 0.06;
      weights.CALM -= 0.1;
    }
    if (inSweet) {
      weights.REST += 0.12;
      weights.CALM += 0.1;
      weights.DASH -= 0.05;
    }
    if (cadence < 0.16) weights.PANIC += 0.08;
    if (cadence > 0.75) weights.DASH += 0.08;

    const entries = Object.entries(weights).map(([key, value]) => [key, Math.max(0.05, value)]);
    const total = entries.reduce((sum, entry) => sum + entry[1], 0);
    let roll = Math.random() * total;
    for (const [key, value] of entries) {
      roll -= value;
      if (roll <= 0) return key;
    }
    return "CALM";
  }

  function buildReelModel(catchData) {
    const line = getLineStats();
    const rod = getRodStats();
    const power = catchData.power;
    const rarity = catchData.rarity;
    const lineTier = line.id;

    const baseCenter = clamp(0.56 + power * 0.12 - (lineTier - 1) * 0.01, 0.48, 0.74);
    const sweetWidth = clamp(0.30 - power * 0.08 + (lineTier - 1) * 0.02, 0.22, 0.32);
    const safeMinRatio = clamp(baseCenter - sweetWidth / 2 - (0.10 + power * 0.03), 0.08, 0.65);
    const sweetMinRatio = clamp(baseCenter - sweetWidth / 2, safeMinRatio + 0.05, 0.78);
    const sweetMaxRatio = clamp(baseCenter + sweetWidth / 2, sweetMinRatio + 0.18, 0.9);
    const dangerMinRatio = clamp(baseCenter + sweetWidth / 2 + (0.10 + power * 0.04), sweetMaxRatio + 0.05, 0.85);

    const scale = line.breakThreshold;
    const zones = {
      safeMin: safeMinRatio * scale,
      sweetMin: sweetMinRatio * scale,
      sweetMax: sweetMaxRatio * scale,
      dangerMin: dangerMinRatio * scale
    };

    return {
      zones,
      baseTapProgress: clamp(0.045 + rod.reelBonus * 0.65 - power * 0.02, 0.02, 0.06),
      slackRisk: 0,
      slackFlash: 0,
      slackHintCooldown: 0,
      tapHistory: [],
      tapCadence: 0.45,
      overload: 0,
      tapFlash: 0,
      tapFlashType: "",
      redTick: 0,
      redTickPos: 0,
      hintCooldown: 0,
      telegraphPulse: 0,
      lineBoost: 0,
      fishForce: 0,
      fatigue: 0,
      bobberDrift: 0,
      fishAI: {
        state: "CALM",
        timer: 0,
        duration: rand(1.0, 1.8),
        forceTarget: 0,
        pendingState: null,
        telegraphTimer: 0,
        telegraphDuration: 0,
        tune: getRarityTuning(rarity)
      }
    };
  }

  // ===== Audio (optional, simple beeps via WebAudio) =====
  let audioCtx = null;
  let muted = false;

  function beep(freq = 440, dur = 0.06, vol = 0.06) {
    if (muted) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const t0 = audioCtx.currentTime;
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(vol, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start(t0);
      o.stop(t0 + dur);
    } catch {}
  }

  function updateMuteButton() {
    if (!btnMute) return;
    btnMute.classList.toggle("is-muted", muted);
    btnMute.setAttribute("aria-label", muted ? "Звук выключен" : "Звук включен");
    const icon = btnMute.querySelector(".icon");
    if (icon) icon.textContent = muted ? "🔇" : "🔊";
  }

  btnMute?.addEventListener("click", () => {
    muted = !muted;
    updateMuteButton();
    if (!muted) beep(660, 0.06, 0.05);
  });

  // ===== DPI / Resize =====
  let W = 0, H = 0, DPR = 1;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    DPR = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
    W = Math.max(1, Math.floor(rect.width));
    H = Math.max(1, Math.floor(rect.height));

    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    scene.horizonY = Math.floor(H * 0.44);
    scene.lakeY = Math.floor(H * 0.58);
    scene.dockY = scene.lakeY - 12;

    rod.baseX = Math.floor(W * 0.22);
    rod.baseY = scene.dockY - 14;
    rod.tipX = rod.baseX + Math.floor(W * ROD_LENGTH_FACTOR);
    rod.tipY = rod.baseY - Math.floor(H * 0.12);
    rod.width = ROD_WIDTH;

    // keep bobber stable if visible
    if (bobber.visible) {
      bobber.x = clamp(bobber.x, W * 0.34, W * 0.92);
      bobber.y = clamp(bobber.y, scene.lakeY + 16, H - 30);
    }

    layoutCity();
  }
  const handleResize = debounce(() => {
    setVhVar();
    resize();
    applyLakeRig();
    if (!bobber.visible) {
      syncBobberToRodTip();
    }
  }, 100);
  window.addEventListener("resize", handleResize);
  window.addEventListener("orientationchange", handleResize);

  // ===== Persistent state =====
  const STORAGE_KEY = "icefish_v1";
  const STORAGE_VERSION = 5;

  const stats = {
    coins: 0,
    fish: 0,
    bestCoin: 0,
  };

  const player = {
    coins: 0,
    activeBaitId: null,
    baitInventory: {},
    rodTier: 1,
    lineTier: 1,
    playerLevel: 1,
    playerXP: 0,
    playerXPTotal: 0,
    playerXPToNext: 60
  };

  const reps = {
    fishShop: 30,
    trophy: 30,
    gearShop: 30
  };

  let citySession = {
    fishShopGold: 0,
    fishShopFishKg: 0,
    trophyGold: 0,
    trophyFishKg: 0,
    gearShopGold: 0
  };

  let inventory = [];
  let inventorySort = "WEIGHT_DESC";
  let activeQuests = [];
  let currentScene = SCENE_LAKE;
  let pendingCatch = null;
  let selectedShopItemId = null;
  let negotiatedPrice = null;
  let foundTrash = {};
  let collectorRodUnlocked = false;
  let dailyRareBoostCharges = 0;
  let lastChargeResetDate = null;

  const progression = {
    xpRequired(level) {
      const lvl = Math.max(1, Math.floor(level || 1));
      const delta = lvl - 1;
      return Math.round(60 + delta * 25 + delta * delta * 6);
    },
    normalize() {
      let levelsGained = 0;
      while (player.playerXP >= player.playerXPToNext) {
        player.playerXP -= player.playerXPToNext;
        player.playerLevel += 1;
        player.playerXPToNext = this.xpRequired(player.playerLevel);
        levelsGained += 1;
      }
      return levelsGained;
    },
    load(savedPlayer = {}) {
      const level = Number(savedPlayer.playerLevel ?? 1);
      const xp = Number(savedPlayer.playerXP ?? 0);
      const total = Number(savedPlayer.playerXPTotal ?? 0);
      const next = Number(savedPlayer.playerXPToNext ?? this.xpRequired(level));
      player.playerLevel = Number.isFinite(level) && level > 0 ? Math.floor(level) : 1;
      player.playerXP = Number.isFinite(xp) && xp >= 0 ? Math.floor(xp) : 0;
      player.playerXPTotal = Number.isFinite(total) && total >= 0 ? Math.floor(total) : 0;
      player.playerXPToNext = Number.isFinite(next) && next > 0 ? Math.floor(next) : this.xpRequired(player.playerLevel);
      this.normalize();
    },
    save() {
      return {
        playerLevel: player.playerLevel,
        playerXP: player.playerXP,
        playerXPTotal: player.playerXPTotal,
        playerXPToNext: player.playerXPToNext
      };
    },
    awardXP({ speciesId, rarity, weightKg }) {
      const rarityMap = {
        common: 10,
        uncommon: 18,
        rare: 30,
        epic: 50,
        legendary: 80
      };
      const baseXP = rarityMap[rarity] ?? rarityMap.common;
      const weight = Number(weightKg) || 0;
      const weightFactor = 1 + clamp(weight / 5, 0, 1.2);
      const gainedXP = Math.max(1, Math.round(baseXP * weightFactor));
      player.playerXP += gainedXP;
      player.playerXPTotal += gainedXP;
      const levelsGained = this.normalize();
      return {
        gainedXP,
        leveledUp: levelsGained > 0,
        levelsGained,
        level: player.playerLevel,
        xp: player.playerXP,
        xpToNext: player.playerXPToNext,
        speciesId
      };
    }
  };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const obj = JSON.parse(raw);
      stats.coins = Number(obj.coins || 0);
      stats.fish = Number(obj.fish || 0);
      stats.bestCoin = Number(obj.bestCoin || 0);
      muted = !!obj.muted;
      if (obj.storageVersion >= 2 && Array.isArray(obj.inventory)) {
        inventory = obj.inventory;
      }
      if (obj.storageVersion >= 3) {
        const savedPlayer = obj.player || {};
        player.coins = Number(savedPlayer.coins || stats.coins || 0);
        player.activeBaitId = savedPlayer.activeBaitId || null;
        player.baitInventory = savedPlayer.baitInventory || {};
        player.rodTier = Number(savedPlayer.rodTier || 1);
        player.lineTier = Number(savedPlayer.lineTier || 1);
        progression.load(savedPlayer);
        const savedReps = obj.reps || {};
        reps.fishShop = Number(savedReps.fishShop ?? reps.fishShop);
        reps.trophy = Number(savedReps.trophy ?? reps.trophy);
        reps.gearShop = Number(savedReps.gearShop ?? reps.gearShop);
        citySession = Object.assign(citySession, obj.citySession || {});
        activeQuests = Array.isArray(obj.quests) ? obj.quests : [];
      } else {
        player.coins = stats.coins;
        progression.load();
      }
      if (obj.storageVersion >= 5) {
        foundTrash = (obj.foundTrash && typeof obj.foundTrash === "object") ? obj.foundTrash : {};
        collectorRodUnlocked = !!obj.collectorRodUnlocked;
        dailyRareBoostCharges = Number(obj.dailyRareBoostCharges ?? 0);
        lastChargeResetDate = obj.lastChargeResetDate || null;
      }
      stats.coins = player.coins;
      refreshDailyCharges();
      updateMuteButton();
    } catch {}
  }

  function save() {
    try {
      stats.coins = player.coins;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        storageVersion: STORAGE_VERSION,
        coins: player.coins,
        fish: stats.fish,
        bestCoin: stats.bestCoin,
        muted,
        inventory,
        foundTrash,
        collectorRodUnlocked,
        dailyRareBoostCharges,
        lastChargeResetDate,
        player: {
          coins: player.coins,
          activeBaitId: player.activeBaitId,
          baitInventory: player.baitInventory,
          rodTier: player.rodTier,
          lineTier: player.lineTier,
          ...progression.save()
        },
        reps: {
          fishShop: reps.fishShop,
          trophy: reps.trophy,
          gearShop: reps.gearShop
        },
        citySession,
        quests: activeQuests
      }));
    } catch {}
  }

  function resetProgress() {
    stats.coins = 0;
    player.coins = 0;
    stats.fish = 0;
    stats.bestCoin = 0;
    inventory = [];
    player.activeBaitId = null;
    player.baitInventory = {};
    player.rodTier = 1;
    player.lineTier = 1;
    player.playerLevel = 1;
    player.playerXP = 0;
    player.playerXPTotal = 0;
    player.playerXPToNext = progression.xpRequired(1);
    reps.fishShop = 30;
    reps.trophy = 30;
    reps.gearShop = 30;
    foundTrash = {};
    collectorRodUnlocked = false;
    dailyRareBoostCharges = 0;
    lastChargeResetDate = null;
    activeQuests = [];
    save();
    updateHUD();
    renderInventory();
    renderTrashJournal();
  }

  btnReset?.addEventListener("click", () => {
    resetProgress();
    setOverlayText("Прогресс сброшен. Нажми «Играть».");
  });

  function updateHUD() {
    if (coinsEl) coinsEl.textContent = String(player.coins);
    if (fishEl) fishEl.textContent = String(stats.fish);
    if (playerLevelEl) playerLevelEl.textContent = String(player.playerLevel);
    if (xpTextEl) xpTextEl.textContent = `${player.playerXP}/${player.playerXPToNext}`;
    if (xpBarFill) {
      const xpPct = player.playerXPToNext > 0 ? clamp(player.playerXP / player.playerXPToNext, 0, 1) * 100 : 0;
      xpBarFill.style.width = `${xpPct}%`;
    }
    updateRareBoostHud();
    updateTrashRewardStatus();
  }

  function getFoundTrashCount() {
    return Object.keys(foundTrash).length;
  }

  function updateRareBoostHud() {
    if (!rareBoostHud) return;
    if (!collectorRodUnlocked || currentScene !== SCENE_LAKE) {
      rareBoostHud.classList.add("hidden");
      return;
    }
    const text = `Редкий улов: ${dailyRareBoostCharges}/10`;
    rareBoostHud.textContent = DEV_TRASH_TEST ? `${text} TEST` : text;
    rareBoostHud.classList.remove("hidden");
  }

  function updateTrashRewardStatus() {
    if (!trashRewardStatus) return;
    if (collectorRodUnlocked) {
      trashRewardStatus.textContent = "Награда: Удочка «Собиратель» получена.";
      return;
    }
    trashRewardStatus.textContent = `Найдено: ${getFoundTrashCount()}/${trashItems.length}. Награда: Удочка «Собиратель».`;
  }

  function refreshDailyCharges() {
    const today = formatDayKey();
    if (lastChargeResetDate !== today) {
      lastChargeResetDate = today;
      dailyRareBoostCharges = collectorRodUnlocked ? 10 : 0;
    }
  }

  function spendRareBoostCharge() {
    refreshDailyCharges();
    if (!collectorRodUnlocked) return false;
    if (dailyRareBoostCharges <= 0) return false;
    dailyRareBoostCharges -= 1;
    return true;
  }

  function resetRareBoostCharges() {
    dailyRareBoostCharges = collectorRodUnlocked ? 10 : 0;
    lastChargeResetDate = formatDayKey();
    updateHUD();
    save();
  }

  function renderTrashJournal() {
    if (!trashGrid) return;
    trashGrid.innerHTML = "";
    trashItems.forEach((item) => {
      const found = !!foundTrash[item.id];
      const cell = document.createElement("div");
      cell.className = `trashCell ${found ? "is-found" : "is-missing"}`;
      const name = document.createElement("div");
      name.className = "trashName";
      name.textContent = found ? item.name : "???";
      cell.append(name);
      trashGrid.append(cell);
    });
    updateTrashRewardStatus();
  }

  function unlockCollectorRod() {
    if (collectorRodUnlocked) return;
    collectorRodUnlocked = true;
    dailyRareBoostCharges = 10;
    lastChargeResetDate = formatDayKey();
    showToast("Награда получена: Удочка \"Собиратель\".");
  }

  function awardTrashCatch(catchData) {
    if (!catchData) return;
    const alreadyFound = !!foundTrash[catchData.trashId];
    if (!alreadyFound) {
      foundTrash[catchData.trashId] = true;
      showToast(`Найдено: ${catchData.name}.`);
    } else {
      const bonus = DEV_TRASH_TEST ? 25 : 6;
      player.coins += bonus;
      showToast(`Повтор: ${catchData.name}. +${bonus} монет.`);
    }
    if (getFoundTrashCount() >= trashItems.length) {
      unlockCollectorRod();
    }
    updateHUD();
    renderTrashJournal();
    save();
  }

  function openInventory() {
    invOverlay?.classList.remove("hidden");
    if (invSort) invSort.value = inventorySort;
    renderInventory();
  }

  function closeInventory() {
    invOverlay?.classList.add("hidden");
  }

  function openTrashJournal() {
    trashOverlay?.classList.remove("hidden");
    renderTrashJournal();
  }

  function closeTrashJournal() {
    trashOverlay?.classList.add("hidden");
  }

  btnInventory?.addEventListener("click", () => {
    if (currentScene !== SCENE_LAKE) return;
    openInventory();
  });

  btnJournal?.addEventListener("click", () => {
    if (currentScene !== SCENE_LAKE) return;
    openTrashJournal();
  });

  btnInvClose?.addEventListener("click", () => {
    closeInventory();
  });

  btnTrashClose?.addEventListener("click", () => {
    closeTrashJournal();
  });

  if (btnTrashFill) {
    btnTrashFill.classList.toggle("hidden", !DEV_TRASH_TEST);
    btnTrashFill.addEventListener("click", () => {
      if (!DEV_TRASH_TEST) return;
      foundTrash = Object.fromEntries(trashItems.map((item) => [item.id, true]));
      unlockCollectorRod();
      renderTrashJournal();
      updateHUD();
      save();
    });
  }

  if (btnResetCharges) {
    btnResetCharges.classList.toggle("hidden", !DEV_TRASH_TEST);
    btnResetCharges.addEventListener("click", () => {
      if (!DEV_TRASH_TEST) return;
      resetRareBoostCharges();
      showToast("TEST: заряды сброшены.");
    });
  }

  document.addEventListener("keydown", (event) => {
    if (!DEV_TRASH_TEST) return;
    if (event.code === "KeyR") {
      resetRareBoostCharges();
      showToast("TEST: заряды сброшены.");
    }
    if (event.code === "KeyF") {
      foundTrash = Object.fromEntries(trashItems.map((item) => [item.id, true]));
      unlockCollectorRod();
      renderTrashJournal();
      updateHUD();
      save();
      showToast("TEST: журнал заполнен.");
    }
  });

  function openProgress() {
    if (!progressOverlay) return;
    progressOverlay.classList.remove("hidden");
    updateHUD();
  }

  function closeProgress() {
    progressOverlay?.classList.add("hidden");
  }

  btnProgress?.addEventListener("click", () => {
    if (currentScene !== SCENE_LAKE) return;
    openProgress();
  });

  btnProgressClose?.addEventListener("click", () => {
    closeProgress();
  });

  invSort?.addEventListener("change", () => {
    inventorySort = invSort.value;
    renderInventory();
  });

  btnCity?.addEventListener("click", () => {
    if (currentScene !== SCENE_LAKE) return;
    travel.t = 0;
    transitionTo(SCENE_TRAVEL);
  });

  btnBackToLake?.addEventListener("click", () => {
    transitionTo(SCENE_LAKE);
    setHint("Тап: заброс", 1.2);
  });

  btnShopClose?.addEventListener("click", () => {
    transitionTo(SCENE_CITY);
  });

  btnCatchKeep?.addEventListener("click", () => {
    if (!pendingCatch) return;
    const makeTrophyFlag = !!catchTrophyToggle?.checked && pendingCatch.weightKg >= 5.0;
    addCatch(pendingCatch, makeTrophyFlag);
    save();
    pendingCatch = null;
    transitionTo(SCENE_LAKE);
    setHint("Тап: заброс", 1.2);
  });

  btnCatchSellNow?.addEventListener("click", () => {
    if (!pendingCatch) return;
    const discounted = Math.round(pendingCatch.sellValue * 0.7);
    player.coins += discounted;
    stats.bestCoin = Math.max(stats.bestCoin, discounted);
    updateHUD();
    save();
    pendingCatch = null;
    transitionTo(SCENE_LAKE);
    showToast("Продано со скидкой -30%.");
    setHint("Тап: заброс", 1.2);
  });

  btnHaggle?.addEventListener("click", () => {
    if (!selectedShopItemId) return;
    if (!canAttemptHaggle()) {
      showToast("Нужно 50% репутации.");
      return;
    }
    const item = inventory.find((entry) => entry.id === selectedShopItemId);
    if (!item) return;
    const baseOffer = getFishShopOffer(item);
    const percent = Number(haggleSelect?.value || 0);
    if (percent <= 0) {
      negotiatedPrice = baseOffer;
      renderOfferPanel("fish", item, baseOffer);
      return;
    }
    const successChance = clamp(0.45 + reps.fishShop / 200 - percent / 120, 0.2, 0.75);
    const success = Math.random() < successChance;
    if (success) {
      negotiatedPrice = Math.round(baseOffer * (1 + percent / 100));
      reps.fishShop = clamp(reps.fishShop - Math.ceil(percent / 4), 0, 100);
      showToast("Торг успешен! Но репутация падает.");
    } else {
      negotiatedPrice = Math.round(baseOffer * 0.95);
      reps.fishShop = clamp(reps.fishShop - Math.ceil(percent / 6), 0, 100);
      showToast("Торг не удался.");
    }
    save();
    renderOfferPanel("fish", item, baseOffer);
    renderShopStats("fish");
  });

  btnSellOffer?.addEventListener("click", () => {
    if (!selectedShopItemId) return;
    const item = inventory.find((entry) => entry.id === selectedShopItemId);
    if (!item) return;
    const sceneType = currentScene === SCENE_BUILDING_TROPHY ? "trophy" : "fish";
    const baseOffer = sceneType === "trophy" ? getTrophyOffer(item) : getFishShopOffer(item);
    const activeOffer = negotiatedPrice ?? baseOffer;
    let discount = 0;
    if (sceneType === "fish") {
      discount = Number(discountSelect?.value || 0);
    }
    const price = Math.round(activeOffer * (1 - discount / 100));
    executeSale(sceneType, item, price, discount);
    selectedShopItemId = null;
    negotiatedPrice = null;
  });

  btnNewQuest?.addEventListener("click", () => {
    takeQuest();
  });

  function sortInventory(items) {
    const sorted = [...items];
    switch (inventorySort) {
      case "WEIGHT_ASC":
        sorted.sort((a, b) => a.weightKg - b.weightKg);
        break;
      case "WEIGHT_DESC":
        sorted.sort((a, b) => b.weightKg - a.weightKg);
        break;
      case "NAME_ASC":
        sorted.sort((a, b) => a.name.localeCompare(b.name, "ru"));
        break;
      case "NAME_DESC":
        sorted.sort((a, b) => b.name.localeCompare(a.name, "ru"));
        break;
      default:
        break;
    }
    return sorted;
  }

  function sellItem() {
    showToast("Продажа доступна только в городе.");
  }

  function makeTrophy(itemId) {
    const item = inventory.find((entry) => entry.id === itemId);
    if (!item || item.isTrophy || !item.canBeTrophy) return;
    item.isTrophy = true;
    save();
    renderInventory();
    setMsg(`Трофей оформлен: ${item.name} (${formatKg(item.weightKg)}).`, 1.5);
  }

  function renderInventory() {
    if (!invList || !invEmpty) return;
    invList.innerHTML = "";

    const items = sortInventory(inventory);
    if (items.length === 0) {
      invEmpty.classList.remove("hidden");
      return;
    }

    invEmpty.classList.add("hidden");

    for (const item of items) {
      const card = document.createElement("div");
      card.className = "invItem";

      const header = document.createElement("div");
      header.className = "invItemHeader";

      const title = document.createElement("div");
      title.className = "invItemTitle";
      title.textContent = item.name;

      const meta = document.createElement("div");
      meta.className = "invItemMeta";

      const rarityBadge = document.createElement("span");
      rarityBadge.className = `badge badge-${item.rarity}`;
      rarityBadge.textContent = rarityLabels[item.rarity] || item.rarity;

      const weight = document.createElement("span");
      weight.className = "invItemWeight";
      weight.textContent = formatKg(item.weightKg);

      meta.append(rarityBadge, weight);

      if (item.isTrophy) {
        const trophy = document.createElement("span");
        trophy.className = "badge badge-trophy";
        trophy.textContent = "Трофей";
        meta.appendChild(trophy);
      }

      const price = document.createElement("div");
      price.className = "invItemPrice";
      price.textContent = `Цена: ${formatCoins(item.sellValue)}`;

      header.append(title, meta);

      const actions = document.createElement("div");
      actions.className = "invActions";

      const detail = document.createElement("div");
      detail.className = "invDetails hidden";
      detail.innerHTML = `
        <div class="invDetailRow"><strong>История:</strong> ${item.story}</div>
        <div class="invDetailRow"><strong>Дата:</strong> ${formatDate(item.caughtAt)}</div>
        <div class="invDetailRow"><strong>Цена за кг:</strong> ${formatCoins(item.pricePerKg)}</div>
        <div class="invDetailRow"><strong>Вес:</strong> ${formatKg(item.weightKg)}</div>
        <div class="invDetailRow"><strong>Итог продажи:</strong> ${formatCoins(item.sellValue)}</div>
      `;

      const btnDetails = document.createElement("button");
      btnDetails.className = "invBtn secondary";
      btnDetails.textContent = "Подробнее";
      btnDetails.addEventListener("click", (event) => {
        event.stopPropagation();
        const isHidden = detail.classList.toggle("hidden");
        btnDetails.textContent = isHidden ? "Подробнее" : "Скрыть";
      });

      if (item.canBeTrophy && !item.isTrophy) {
        const btnTrophy = document.createElement("button");
        btnTrophy.className = "invBtn";
        btnTrophy.textContent = "Сделать трофеем";
        btnTrophy.addEventListener("click", (event) => {
          event.stopPropagation();
          makeTrophy(item.id);
        });
        actions.appendChild(btnTrophy);
      }

      actions.appendChild(btnDetails);

      const detailActions = document.createElement("div");
      detailActions.className = "invActions";

      if (item.canBeTrophy && !item.isTrophy) {
        const btnTrophyDetail = document.createElement("button");
        btnTrophyDetail.className = "invBtn";
        btnTrophyDetail.textContent = "Сделать трофеем";
        btnTrophyDetail.addEventListener("click", (event) => {
          event.stopPropagation();
          makeTrophy(item.id);
        });
        detailActions.appendChild(btnTrophyDetail);
      }

      detail.appendChild(detailActions);

      card.append(header, price, actions, detail);

      card.addEventListener("click", () => {
        const isHidden = detail.classList.toggle("hidden");
        btnDetails.textContent = isHidden ? "Подробнее" : "Скрыть";
      });

      invList.appendChild(card);
    }
  }

  function addCatch(catchData, isTrophy = false) {
    const item = {
      id: makeId(),
      speciesId: catchData.speciesId,
      name: catchData.name,
      rarity: catchData.rarity,
      weightKg: catchData.weightKg,
      pricePerKg: catchData.pricePerKg,
      sellValue: catchData.sellValue,
      story: catchData.story,
      caughtAt: new Date().toISOString(),
      isTrophy,
      canBeTrophy: catchData.weightKg >= 5.0
    };
    inventory.push(item);
    save();
    if (!invOverlay?.classList.contains("hidden")) {
      renderInventory();
    }
  }

  function openShop(sceneId) {
    selectedShopItemId = null;
    negotiatedPrice = null;
    transitionTo(sceneId);
    renderShop(sceneId);
  }

  function renderShop(sceneId = currentScene) {
    if (!shopOverlay) return;
    shopOffer?.classList.add("hidden");
    gearShopSection?.classList.add("hidden");
    shopInventory?.classList.remove("hidden");
    if (sceneId === SCENE_BUILDING_FISHSHOP) {
      if (shopTitle) shopTitle.textContent = "Рыбная лавка";
      renderShopStats("fish");
      renderShopInventory("fish");
    } else if (sceneId === SCENE_BUILDING_TROPHY) {
      if (shopTitle) shopTitle.textContent = "Трофейная лавка";
      renderShopStats("trophy");
      renderShopInventory("trophy");
    } else if (sceneId === SCENE_BUILDING_GEARSHOP) {
      if (shopTitle) shopTitle.textContent = "Всё для рыбалки";
      shopInventory?.classList.add("hidden");
      renderShopStats("gear");
      renderGearShop();
    }
  }

  function renderShopStats(type) {
    if (!shopStats) return;
    if (type === "fish") {
      shopStats.innerHTML = `
        <span>Репутация: ${formatPercent(reps.fishShop)}</span>
        <span>Золото продавца: ${formatCoins(citySession.fishShopGold)}</span>
        <span>Рыбы у продавца: ${citySession.fishShopFishKg.toFixed(1)} кг</span>
      `;
    } else if (type === "trophy") {
      shopStats.innerHTML = `
        <span>Репутация: ${formatPercent(reps.trophy)}</span>
        <span>Золото коллекционера: ${formatCoins(citySession.trophyGold)}</span>
        <span>Трофеев принято: ${citySession.trophyFishKg.toFixed(1)} кг</span>
      `;
    } else {
      shopStats.innerHTML = `
        <span>Репутация: ${formatPercent(reps.gearShop)}</span>
        <span>Активная приманка: ${getActiveBaitLabel()}</span>
        <span>Удочка: ${getRodStats().name}</span>
        <span>Леска: ${getLineStats().name}</span>
      `;
    }
  }

  function renderShopInventory(type) {
    if (!shopInvList || !shopInvEmpty) return;
    shopInvList.innerHTML = "";

    const items = sortInventory(inventory).filter((item) => {
      if (type === "trophy") return item.isTrophy;
      return true;
    });

    if (items.length === 0) {
      shopInvEmpty.classList.remove("hidden");
    } else {
      shopInvEmpty.classList.add("hidden");
    }

    for (const item of items) {
      const card = document.createElement("div");
      card.className = "shopItem";

      const header = document.createElement("div");
      header.className = "shopItemHeader";

      const title = document.createElement("div");
      title.className = "shopItemTitle";
      title.textContent = item.name;

      const meta = document.createElement("div");
      meta.className = "shopItemMeta";
      meta.textContent = `${formatKg(item.weightKg)} • ${rarityLabels[item.rarity] || item.rarity}`;

      header.append(title, meta);

      const offerValue = type === "trophy" ? getTrophyOffer(item) : getFishShopOffer(item);
      const offer = document.createElement("div");
      offer.textContent = `Предложение: ${formatCoins(offerValue)}`;

      const btnSelect = document.createElement("button");
      btnSelect.className = "invBtn";
      btnSelect.textContent = "Выбрать";
      btnSelect.addEventListener("click", () => {
        selectedShopItemId = item.id;
        negotiatedPrice = null;
        renderOfferPanel(type, item, offerValue);
      });

      card.append(header, offer, btnSelect);
      shopInvList.appendChild(card);
    }
  }

  function renderOfferPanel(type, item, baseOffer) {
    if (!shopOffer || !shopOfferInfo || !btnSellOffer) return;
    shopOffer.classList.remove("hidden");
    const canHaggle = type === "fish" && canAttemptHaggle();
    if (btnHaggle) btnHaggle.disabled = type !== "fish" || !canHaggle || citySession.fishShopGold <= 0;
    if (haggleSelect) haggleSelect.disabled = type !== "fish" || !canHaggle;
    if (discountSelect) discountSelect.disabled = type !== "fish";
    if (shopOfferNote) {
      shopOfferNote.textContent = type === "fish"
        ? (canHaggle ? "Торг доступен при репутации 50%+" : "Нужно 50% репутации для торга.")
        : "Коллекционер платит максимум за трофеи.";
    }
    const activeOffer = negotiatedPrice ?? baseOffer;
    const vendorGold = type === "trophy" ? citySession.trophyGold : citySession.fishShopGold;
    const canSell = activeOffer > 0 && vendorGold >= activeOffer;
    btnSellOffer.disabled = !canSell;

    shopOfferInfo.innerHTML = `
      <div><strong>${item.name}</strong> • ${formatKg(item.weightKg)}</div>
      <div>Базовая цена: ${formatCoins(item.sellValue)}</div>
      <div>Предложение: ${formatCoins(activeOffer)}</div>
      <div>Репутация продавца: ${type === "trophy" ? formatPercent(reps.trophy) : formatPercent(reps.fishShop)}</div>
    `;
    if (!canSell && vendorGold < activeOffer) {
      shopOfferNote.textContent = "У продавца не хватает золота.";
    }
  }

  function executeSale(type, item, price, discountPercent = 0) {
    const vendorGoldKey = type === "trophy" ? "trophyGold" : "fishShopGold";
    const vendorKgKey = type === "trophy" ? "trophyFishKg" : "fishShopFishKg";
    if (citySession[vendorGoldKey] < price) {
      showToast("У продавца не хватает золота.");
      return;
    }
    citySession[vendorGoldKey] -= price;
    citySession[vendorKgKey] += item.weightKg;
    inventory = inventory.filter((entry) => entry.id !== item.id);
    player.coins += price;
    stats.bestCoin = Math.max(stats.bestCoin, price);

    if (type === "fish") {
      if (discountPercent > 0) {
        reps.fishShop = clamp(reps.fishShop + discountPercent * 0.4, 0, 100);
        showToast(`Репутация выросла на ${Math.round(discountPercent * 0.4)}%.`);
      }
    } else if (type === "trophy") {
      reps.trophy = clamp(reps.trophy + 1, 0, 100);
    }

    updateHUD();
    save();
    renderShop(type === "fish" ? SCENE_BUILDING_FISHSHOP : SCENE_BUILDING_TROPHY);
    renderInventory();
    showToast(`Продано за ${formatCoins(price)}.`);
  }

  function renderGearShop() {
    if (!gearShopSection) return;
    gearShopSection.classList.remove("hidden");

    if (baitList) {
      baitList.innerHTML = "";
      for (const bait of baitItems) {
        const count = player.baitInventory[bait.id] || 0;
        const item = document.createElement("div");
        item.className = "shopItem";
        item.innerHTML = `
          <div class="shopItemHeader">
            <div class="shopItemTitle">${bait.name}</div>
            <div class="shopItemMeta">${formatCoins(bait.price)}</div>
          </div>
          <div class="shopItemMeta">${bait.note}</div>
          <div class="shopItemMeta">В наличии: ${count}</div>
        `;
        const actions = document.createElement("div");
        actions.className = "shopControls";
        const buyBtn = document.createElement("button");
        buyBtn.className = "invBtn";
        buyBtn.textContent = "Купить";
        buyBtn.disabled = player.coins < bait.price;
        buyBtn.addEventListener("click", () => {
          if (player.coins < bait.price) return;
          player.coins -= bait.price;
          player.baitInventory[bait.id] = (player.baitInventory[bait.id] || 0) + 1;
          save();
          renderGearShop();
          updateHUD();
        });
        const useBtn = document.createElement("button");
        useBtn.className = "invBtn secondary";
        useBtn.textContent = player.activeBaitId === bait.id ? "Выбрано" : "Выбрать";
        useBtn.disabled = count <= 0;
        useBtn.addEventListener("click", () => {
          if (count <= 0) return;
          player.activeBaitId = bait.id;
          save();
          renderGearShop();
        });
        actions.append(buyBtn, useBtn);
        item.appendChild(actions);
        baitList.appendChild(item);
      }
    }

    if (rodList) {
      rodList.innerHTML = "";
      for (const rod of rodItems) {
        const item = document.createElement("div");
        item.className = "shopItem";
        const locked = reps.gearShop < rod.repReq;
        item.innerHTML = `
          <div class="shopItemHeader">
            <div class="shopItemTitle">${rod.name}</div>
            <div class="shopItemMeta">${formatCoins(rod.price)}</div>
          </div>
          <div class="shopItemMeta">Требуется репутация: ${rod.repReq}%</div>
        `;
        const btn = document.createElement("button");
        btn.className = "invBtn";
        btn.textContent = player.rodTier === rod.id ? "Активна" : "Купить";
        btn.disabled = locked || player.rodTier >= rod.id || player.coins < rod.price;
        btn.addEventListener("click", () => {
          if (locked || player.coins < rod.price) return;
          player.coins -= rod.price;
          player.rodTier = rod.id;
          reps.gearShop = clamp(reps.gearShop + 2, 0, 100);
          save();
          renderGearShop();
          updateHUD();
        });
        item.appendChild(btn);
        rodList.appendChild(item);
      }
    }

    if (lineList) {
      lineList.innerHTML = "";
      for (const line of lineItems) {
        const item = document.createElement("div");
        item.className = "shopItem";
        const locked = reps.gearShop < line.repReq;
        item.innerHTML = `
          <div class="shopItemHeader">
            <div class="shopItemTitle">${line.name}</div>
            <div class="shopItemMeta">${formatCoins(line.price)}</div>
          </div>
          <div class="shopItemMeta">Макс. вес: ${line.maxKg} кг</div>
          <div class="shopItemMeta">Требуется репутация: ${line.repReq}%</div>
        `;
        const btn = document.createElement("button");
        btn.className = "invBtn";
        btn.textContent = player.lineTier === line.id ? "Активна" : "Купить";
        btn.disabled = locked || player.lineTier >= line.id || player.coins < line.price;
        btn.addEventListener("click", () => {
          if (locked || player.coins < line.price) return;
          player.coins -= line.price;
          player.lineTier = line.id;
          reps.gearShop = clamp(reps.gearShop + 2, 0, 100);
          save();
          renderGearShop();
          updateHUD();
        });
        item.appendChild(btn);
        lineList.appendChild(item);
      }
    }

    renderQuestList();
    if (btnNewQuest) {
      btnNewQuest.disabled = activeQuests.length >= 2;
    }
    renderShopStats("gear");
  }

  function renderQuestList() {
    if (!questList) return;
    questList.innerHTML = "";
    if (activeQuests.length === 0) {
      const empty = document.createElement("div");
      empty.className = "shopItem";
      empty.textContent = "Нет активных заданий.";
      questList.appendChild(empty);
      return;
    }

    for (const quest of activeQuests) {
      const item = document.createElement("div");
      item.className = "shopItem";
      item.innerHTML = `
        <div class="shopItemHeader">
          <div class="shopItemTitle">${quest.name}</div>
          <div class="shopItemMeta">${formatKg(quest.minWeightKg)} - ${formatKg(quest.maxWeightKg)}</div>
        </div>
        <div class="shopItemMeta">Награда: ${formatCoins(quest.rewardCoins)} + ${quest.rewardRep}% репутации</div>
      `;
      const btn = document.createElement("button");
      btn.className = "invBtn";
      btn.textContent = "Сдать";
      const hasFish = inventory.some((fish) => fish.speciesId === quest.speciesId && fish.weightKg >= quest.minWeightKg && fish.weightKg <= quest.maxWeightKg);
      btn.disabled = !hasFish;
      btn.addEventListener("click", () => {
        submitQuest(quest.id);
      });
      item.appendChild(btn);
      questList.appendChild(item);
    }
  }

  function generateQuest() {
    const species = fishSpeciesTable[Math.floor(Math.random() * fishSpeciesTable.length)];
    const minWeight = Math.max(species.minKg, Math.round((species.minKg + (species.maxKg - species.minKg) * 0.35) * 10) / 10);
    const maxWeight = Math.min(species.maxKg, Math.round((minWeight + (species.maxKg - minWeight) * 0.4) * 10) / 10);
    const rewardCoins = Math.round((minWeight + maxWeight) * species.pricePerKg * 0.8);
    const rewardRep = Math.round(4 + Math.random() * 6);
    return {
      id: `quest-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
      speciesId: species.id,
      name: `Поймать ${species.name}`,
      minWeightKg: minWeight,
      maxWeightKg: maxWeight,
      rewardCoins,
      rewardRep
    };
  }

  function takeQuest() {
    if (activeQuests.length >= 2) {
      showToast("Можно взять только 2 задания.");
      return;
    }
    const quest = generateQuest();
    activeQuests.push(quest);
    save();
    renderQuestList();
  }

  function submitQuest(questId) {
    const questIndex = activeQuests.findIndex((quest) => quest.id === questId);
    if (questIndex === -1) return;
    const quest = activeQuests[questIndex];
    const fishIndex = inventory.findIndex((fish) => fish.speciesId === quest.speciesId && fish.weightKg >= quest.minWeightKg && fish.weightKg <= quest.maxWeightKg);
    if (fishIndex === -1) {
      showToast("Нет подходящей рыбы.");
      return;
    }
    inventory.splice(fishIndex, 1);
    player.coins += quest.rewardCoins;
    reps.gearShop = clamp(reps.gearShop + quest.rewardRep, 0, 100);
    activeQuests.splice(questIndex, 1);
    save();
    updateHUD();
    renderGearShop();
    showToast("Задание выполнено!");
  }

  function initCitySession() {
    citySession = {
      fishShopGold: Math.round(rand(600, 1400)),
      fishShopFishKg: 0,
      trophyGold: Math.round(rand(800, 1600)),
      trophyFishKg: 0,
      gearShopGold: Math.round(rand(600, 1200))
    };
    save();
  }

  function getFishShopOffer(item) {
    const baseOfferFactor = 0.78;
    const stockPenalty = clamp(1 - citySession.fishShopFishKg * 0.03, 0.55, 1);
    const repBonus = 1 + (reps.fishShop - 30) * 0.003;
    const trophyPenalty = item.isTrophy ? 0.65 : 1;
    return Math.round(item.sellValue * baseOfferFactor * stockPenalty * repBonus * trophyPenalty);
  }

  function getTrophyOffer(item) {
    const repBonus = 1 + (reps.trophy - 30) * 0.004;
    const stockPenalty = clamp(1 - citySession.trophyFishKg * 0.02, 0.7, 1);
    return Math.round(item.sellValue * (1.05 + repBonus * 0.12) * stockPenalty);
  }

  function getLineStats() {
    return lineItems.find((line) => line.id === player.lineTier) || lineItems[0];
  }

  function getRodStats() {
    return rodItems.find((rod) => rod.id === player.rodTier) || rodItems[0];
  }

  function canAttemptHaggle() {
    return reps.fishShop >= 50;
  }

  // ===== Scene objects =====
  const scene = {
    t: 0,
    horizonY: 0,
    lakeY: 0,
    dockY: 0,
  };

  const rod = {
    baseX: 0, baseY: 0,
    tipX: 0, tipY: 0,
  };

  const bobber = {
    x: 0, y: 0,
    vx: 0, vy: 0,
    r: 10,
    visible: false,
    inWater: false,
    wave: 0,
  };

  const ripples = [];
  let nextRippleAt = 0;
  let rippleBoostUntil = 0;

  const travel = {
    duration: 20,
    t: 0,
  };

  const cityBuildings = [];

  function layoutCity() {
    cityBuildings.length = 0;
    const groundY = scene.lakeY + 20;
    const baseY = Math.min(H - 80, groundY);
    const houseW = Math.max(80, W * 0.16);
    const houseH = Math.max(70, H * 0.18);
    const startX = W * 0.12;
    const gap = W * 0.12;

    cityBuildings.push({
      id: SCENE_BUILDING_FISHSHOP,
      label: "Рыбная лавка",
      x: startX,
      y: baseY - houseH,
      w: houseW,
      h: houseH
    });
    cityBuildings.push({
      id: SCENE_BUILDING_TROPHY,
      label: "Трофеи",
      x: startX + houseW + gap,
      y: baseY - houseH - 10,
      w: houseW,
      h: houseH
    });
    cityBuildings.push({
      id: SCENE_BUILDING_GEARSHOP,
      label: "Снасти",
      x: startX + (houseW + gap) * 2,
      y: baseY - houseH + 6,
      w: houseW,
      h: houseH
    });
  }

  // ===== Gameplay state machine =====
  // IDLE -> CASTING -> WAITING -> BITE -> HOOKED -> REELING -> LANDED/ESCAPED
  const game = {
    mode: "INTRO",
    t: 0,
    biteAt: 0,
    biteWindow: 0.85,
    fishPower: 0.0,
    rarity: "обычная",
    reward: 0,
    catch: null,
    rareBoostActive: false,
    // reel mechanics
    progress: 0,
    need: 1.0,
    tension: 0.35,    // 0..1
    tensionVel: 0.0,
    reel: null,
    // input
    lastTap: 999,
    // messages
    msg: "",
    msgT: 0,
  };

  function setHintTexts(weightTextOrNull, speciesTextOrNull) {
    if (!fishHintText) return;
    if (revealHintHideTimer) {
      window.clearTimeout(revealHintHideTimer);
      revealHintHideTimer = null;
    }
    const nextWeight = weightTextOrNull || "";
    const nextSpecies = speciesTextOrNull || "";
    const combined = `${nextWeight} ${nextSpecies}`.trim();
    if (combined !== lastFishHintText) {
      fishHintText.textContent = combined;
      fishHintText.setAttribute("aria-hidden", combined ? "false" : "true");
      lastFishHintText = combined;
    }
  }

  function scheduleRevealHintHide(delay = 260) {
    if (!fishHintText) return;
    if (revealHintHideTimer) window.clearTimeout(revealHintHideTimer);
    revealHintHideTimer = window.setTimeout(() => {
      setHintTexts(null, null);
    }, delay);
  }

  function showHint(text, duration = 1.4) {
    if (!hintToast || !text) return;
    const next = text.trim();
    if (!next) return;
    if (hintHideTimer) window.clearTimeout(hintHideTimer);
    hintToast.textContent = next;
    hintToast.classList.remove("hidden");
    hintToast.classList.add("show");
    hintHideTimer = window.setTimeout(() => {
      hintToast.classList.remove("show");
      window.setTimeout(() => hintToast.classList.add("hidden"), 220);
    }, duration * 1000);
  }

  function setHint(text, duration) {
    if (!text) return;
    const inFight = game.mode === "REELING";
    const safeDuration = inFight ? 0.9 : (duration ?? 1.6);
    showHint(text, safeDuration);
  }

  function setMsg(text, seconds = 1.2) {
    game.msg = text;
    game.msgT = seconds;
    setHint(text, Math.min(2.0, Math.max(0.8, seconds)));
  }

  function showOverlay() {
    overlay?.classList.remove("hidden");
  }
  function hideOverlay() {
    overlay?.classList.add("hidden");
  }
  function setOverlayText(text) {
    if (ovText) ovText.textContent = text;
  }

  let catchOverlayVisible = false;
  let catchOverlayHideTimer = null;

  function setCatchOverlayVisible(visible) {
    if (!catchOverlay) return;
    if (catchOverlayVisible === visible) return;
    catchOverlayVisible = visible;
    if (catchOverlayHideTimer) window.clearTimeout(catchOverlayHideTimer);
    if (visible) {
      catchOverlay.classList.remove("hidden");
      catchOverlay.classList.remove("is-hiding");
      requestAnimationFrame(() => {
        catchOverlay.classList.add("is-visible");
      });
      return;
    }
    catchOverlay.classList.remove("is-visible");
    catchOverlay.classList.add("is-hiding");
    catchOverlayHideTimer = window.setTimeout(() => {
      if (!catchOverlayVisible) {
        catchOverlay.classList.add("hidden");
        catchOverlay.classList.remove("is-hiding");
      }
    }, 220);
  }

  function setScene(sceneId) {
    currentScene = sceneId;
    setCatchOverlayVisible(sceneId === SCENE_CATCH_MODAL);
    travelHud?.classList.toggle("hidden", sceneId !== SCENE_TRAVEL);
    cityHud?.classList.toggle("hidden", sceneId !== SCENE_CITY);
    shopOverlay?.classList.toggle("hidden", ![SCENE_BUILDING_FISHSHOP, SCENE_BUILDING_TROPHY, SCENE_BUILDING_GEARSHOP].includes(sceneId));
    btnCity?.classList.toggle("hidden", sceneId !== SCENE_LAKE);
    btnInventory?.classList.toggle("hidden", sceneId !== SCENE_LAKE);
    btnJournal?.classList.toggle("hidden", sceneId !== SCENE_LAKE);
    btnProgress?.classList.toggle("hidden", sceneId !== SCENE_LAKE);
    if (rareBoostHud) rareBoostHud.classList.toggle("hidden", sceneId !== SCENE_LAKE || !collectorRodUnlocked);
    if (sceneId !== SCENE_LAKE && invOverlay) invOverlay.classList.add("hidden");
    if (sceneId !== SCENE_LAKE && trashOverlay) trashOverlay.classList.add("hidden");
    if (sceneId !== SCENE_LAKE && progressOverlay) progressOverlay.classList.add("hidden");
  }

  function transitionTo(sceneId) {
    if (!sceneFade) {
      setScene(sceneId);
      return;
    }
    sceneFade.classList.remove("hidden");
    sceneFade.classList.add("active");
    setTimeout(() => {
      setScene(sceneId);
      sceneFade.classList.remove("active");
      setTimeout(() => sceneFade.classList.add("hidden"), 320);
    }, 220);
  }

  function startGame() {
    hideOverlay();
    game.mode = "IDLE";
    game.t = 0;
    bobber.visible = false;
    bobber.inWater = false;
    setFishing(false);
    revealSystem.reset();
    refreshDailyCharges();
    game.rareBoostActive = false;
    setHintTexts(null, null);
    setScene(SCENE_LAKE);
    idleHintShown = false;
    if (castHintCount < 2) {
      setHint("Тап: заброс", 1.4);
      castHintCount += 1;
    }
    updateHUD();
    save();
  }

  btnPlay?.addEventListener("click", () => {
    // iOS: аудио можно стартовать только после жеста
    beep(520, 0.05, 0.04);
    startGame();
  });

  // ===== Fishing logic =====
  function scheduleBite() {
    game.biteAt = rand(1.2, 3.8);
  }

  function consumeBait() {
    if (!player.activeBaitId) return;
    const count = player.baitInventory[player.activeBaitId] || 0;
    if (count <= 0) {
      player.activeBaitId = null;
      return;
    }
    player.baitInventory[player.activeBaitId] = Math.max(0, count - 1);
    if (player.baitInventory[player.activeBaitId] <= 0) {
      player.activeBaitId = null;
      showToast("Приманка закончилась.");
    }
    save();
  }

  function castTo(x, y) {
    game.mode = "CASTING";
    game.t = 0;
    idleHintShown = true;
    game.rareBoostActive = spendRareBoostCharge();
    updateHUD();
    save();
    animateCastToHole();

    bobber.visible = true;
    bobber.inWater = false;
    bobber.wave = 0;
    const rodTip = getRodTipPoint();
    bobber.x = rodTip ? rodTip.x : rod.tipX;
    bobber.y = rodTip ? rodTip.y : rod.tipY;

    const tx = clamp(x, W * 0.40, W * 0.92);
    const ty = scene.lakeY + 18;

    const flight = 0.55;
    bobber.vx = (tx - bobber.x) / flight;
    bobber.vy = (ty - bobber.y) / flight - 230;

    beep(440, 0.06, 0.04);
    consumeBait();
    setMsg("Заброс.", 0.7);
  }

  function enterWaiting() {
    game.mode = "WAITING";
    game.t = 0;
    scheduleBite();
    setFishing(true);
    setMsg("Ждём поклёвку…", 1.0);
    if (!reducedEffects) {
      nextRippleAt = scene.t + rand(1.4, 2.6);
    }
  }

  function enterBite() {
    game.mode = "BITE";
    game.t = 0;
    triggerBite();
    beep(820, 0.08, 0.05);
    setMsg("ПОКЛЁВКА! Свайп вверх.", 1.0);
  }

  function hook() {
    if (game.mode !== "BITE") return;
    triggerStrike();

    const catchData = buildCatch();
    game.catch = catchData;
    game.rarity = catchData.rarityLabel;
    game.fishPower = catchData.power;
    game.reward = catchData.sellValue;
    if (catchData.catchType === "fish") {
      revealSystem.startAttempt(catchData);
    } else {
      revealSystem.reset();
      setHintTexts(null, null);
    }
    const line = getLineStats();

    // reel mechanics
    game.progress = 0;
    // tougher fights: strong fish require more total progress
    game.need = clamp(1.10 + game.fishPower * 1.35, 1.35, 2.7);
    game.reel = buildReelModel(catchData);
    const weightKg = catchData.weightKg || 0;
    const weightPenalty = weightKg > line.maxKg ? (1 + (weightKg - line.maxKg) * 0.05) : 1;
    game.reel.fishAI.forceTarget = getStateForceTarget("CALM", game.reel.fishAI.tune, game.fishPower, weightPenalty);
    game.tension = clamp(
      (game.reel.zones.sweetMin + game.reel.zones.sweetMax) * 0.55,
      game.reel.zones.safeMin * 0.9,
      game.reel.zones.dangerMin - 0.04
    );
    game.tensionVel = 0;

    game.mode = "HOOKED";
    game.t = 0;
    beep(960, 0.06, 0.06);
    setMsg("Подсечка!", 0.9);
  }

  function startReel() {
    game.mode = "REELING";
    game.t = 0;
    game.lastTap = 999;
    setFishing(true);
    setHintTexts(null, null);
    setHint("Жми", 0.9);
  }

  function openCatchModal(catchData) {
    if (!catchData) return;
    const isTrash = catchData.catchType === "trash";
    pendingCatch = catchData;
    if (catchTitle) catchTitle.textContent = isTrash ? "Находка!" : "Поймал рыбу!";
    if (catchName) catchName.textContent = catchData.name;
    if (catchRarity) {
      catchRarity.textContent = catchData.rarityLabel;
      catchRarity.className = `badge badge-${catchData.rarity}`;
    }
    if (catchWeight) catchWeight.textContent = formatKg(catchData.weightKg);
    if (catchStory) {
      const story = (catchData.story || "").trim();
      const caughtSpecies = readCaughtSpecies();
      const speciesKey = catchData.speciesId || catchData.name;
      const isFirst = story && !caughtSpecies.has(speciesKey);
      let nextStory = "";
      if (story) {
        if (isFirst) {
          caughtSpecies.add(speciesKey);
          writeCaughtSpecies(caughtSpecies);
          nextStory = story;
        } else {
          const limit = 68;
          nextStory = story.length > limit ? `${story.slice(0, limit).trim()}…` : story;
        }
      }
      catchStory.textContent = nextStory;
      catchStory.classList.toggle("hidden", !nextStory);
    }
    if (catchFullPrice) catchFullPrice.textContent = formatCoins(catchData.sellValue);
    const discounted = Math.round(catchData.sellValue * 0.7);
    if (catchDiscountPrice) catchDiscountPrice.textContent = formatCoins(discounted);
    if (catchTrophyWrap) {
      catchTrophyWrap.classList.toggle("hidden", isTrash || !catchData.weightKg || catchData.weightKg < 5.0);
    }
    if (catchTrophyToggle) catchTrophyToggle.checked = false;
    transitionTo(SCENE_CATCH_MODAL);
  }

  function land() {
    if (!game.catch) return;

    if (game.catch.catchType === "trash") {
      game.mode = "LANDED";
      game.t = 0;
      beep(660, 0.08, 0.06);
      setMsg(`Нашёл: ${game.catch.name}.`, 1.8);
      revealSystem.reset();
      scheduleRevealHintHide(260);
      awardTrashCatch(game.catch);
      game.catch = null;
      return;
    }

    stats.fish += 1;
    const xpResult = progression.awardXP({
      speciesId: game.catch.speciesId,
      rarity: game.catch.rarity,
      weightKg: game.catch.weightKg
    });
    updateHUD();
    showXPGain(xpResult);
    save();

    game.mode = "LANDED";
    game.t = 0;
    beep(660, 0.08, 0.06);
    setMsg(`Поймал: ${game.catch.name} ${formatKg(game.catch.weightKg)}.`, 1.8);
    revealSystem.reset();
    scheduleRevealHintHide(260);

    openCatchModal(game.catch);
    game.catch = null;
  }

  // ===== Input (tap + swipe) =====
  let pointerDown = false;
  let startX = 0, startY = 0;
  let lastX = 0, lastY = 0;
  let swipeDone = false;

  function getXY(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onDown(e) {
    e.preventDefault();
    pointerDown = true;
    swipeDone = false;
    const p = getXY(e);
    startX = lastX = p.x;
    startY = lastY = p.y;

    if (currentScene === SCENE_CITY) {
      const hit = cityBuildings.find((b) => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h);
      if (hit) {
        openShop(hit.id);
      }
      return;
    }

    if (currentScene !== SCENE_LAKE) return;

    // tap actions
    if (game.mode === "IDLE") {
      // cast to tap point (or mid-lake if tap outside)
      const y = clamp(p.y, scene.lakeY - 10, H - 20);
      castTo(p.x, y);
      return;
    }

    if (game.mode === "WAITING" || game.mode === "BITE") {
      triggerStrike();
    }

    if (game.mode === "REELING") {
      const reel = game.reel;
      if (!reel) return;

      // tap cadence tracking
      if (Number.isFinite(game.lastTap)) {
        reel.tapHistory.push(game.lastTap);
        if (reel.tapHistory.length > TAP_HISTORY) reel.tapHistory.shift();
        const avg = reel.tapHistory.reduce((sum, v) => sum + v, 0) / reel.tapHistory.length;
        reel.tapCadence = clamp(avg, 0.08, 1.2);
      }
      game.lastTap = 0;

      const line = getLineStats();
      const rod = getRodStats();
      const weightKg = game.catch?.weightKg || 0;
      const weightPenalty = weightKg > line.maxKg ? (1 + (weightKg - line.maxKg) * 0.05) : 1;
      const tensionBefore = game.tension;

      const tapImpulse = clamp(0.42 + rod.reelBonus * 1.3 - game.fishPower * 0.18, 0.22, 0.7)
        * line.tensionMult * weightPenalty;
      game.tensionVel += tapImpulse;

      if (reel.tapCadence < 0.16) {
        reel.overload = clamp(reel.overload + 0.25, 0, 1);
        game.tensionVel += tapImpulse * 0.25;
      }

      const tensionAfter = clamp(game.tension + game.tensionVel * 0.05, 0, TENSION_MAX);
      const tapZone = getTensionZone(tensionAfter);
      const gain = getTapProgressGain(tapZone, game.need);
      if (gain > 0) {
        game.progress = clamp(game.progress + gain, 0, game.need);
        if (game.progress >= game.need) {
          land();
          return;
        }
      }
      if (reel.hintCooldown <= 0) {
        if (tapZone === "GREEN") setHint("Жми");
        else if (tapZone === "YELLOW") setHint("Чуть сильнее");
        else if (tapZone === "RED") setHint("Ослабь");
        else if (tapZone === "DANGER") setHint("Пауза");
        else setHint("Слабина");
        reel.hintCooldown = 0.25;
      }

      if (tapZone === "GREEN") {
        reel.tapFlash = 0.15;
        reel.tapFlashType = "green";
        beep(680, 0.03, 0.03);
      } else if (tapZone === "DANGER") {
        reel.redTick = 0.2;
        reel.redTickPos = clamp(tensionBefore / line.breakThreshold, 0, 1);
        beep(360, 0.04, 0.03);
      } else {
        reel.tapFlashType = "yellow";
        beep(520, 0.03, 0.03);
      }
      return;
    }
  }

  function onMove(e) {
    if (!pointerDown) return;
    e.preventDefault();
    const p = getXY(e);
    lastX = p.x;
    lastY = p.y;

    // swipe up during bite
    if (game.mode === "BITE" && !swipeDone) {
      const dy = p.y - startY;
      const dx = p.x - startX;

      if (dy < -42 && Math.abs(dy) > Math.abs(dx) * 1.2) {
        swipeDone = true;
        hook();
      }
    }
  }

  function onUp(e) {
    e.preventDefault();
    if (pointerDown && game.mode === "BITE" && !swipeDone) {
      const p = typeof e.clientX === "number" ? getXY(e) : { x: lastX, y: lastY };
      const dy = p.y - startY;
      const dx = p.x - startX;

      if (dy < -42 && Math.abs(dy) > Math.abs(dx) * 1.2) {
        swipeDone = true;
        hook();
      }
    }
    pointerDown = false;
  }

  canvas.style.touchAction = "none";
  canvas.addEventListener("pointerdown", onDown, { passive: false });
  canvas.addEventListener("pointermove", onMove, { passive: false });
  canvas.addEventListener("pointerup", onUp, { passive: false });
  canvas.addEventListener("pointercancel", onUp, { passive: false });

  // ===== Update loop =====
  let lastTime = 0;
  let lowFpsFrames = 0;
  const LOW_FPS_THRESHOLD = 44;

  function update(dt) {
    scene.t += dt;
    game.t += dt;
    game.lastTap += dt;
    if (game.msgT > 0) game.msgT -= dt;

    if (currentScene === SCENE_TRAVEL) {
      travel.t += dt;
      const remaining = Math.max(0, travel.duration - travel.t);
      if (travelTimer) {
        const m = Math.floor(remaining / 60).toString().padStart(2, "0");
        const s = Math.floor(remaining % 60).toString().padStart(2, "0");
        travelTimer.textContent = `До города: ${m}:${s}`;
      }
      if (travel.t >= travel.duration) {
        initCitySession();
        showToast("Продавцы обновили запасы золота.");
        transitionTo(SCENE_CITY);
      }
      return;
    }

    if (currentScene !== SCENE_LAKE && currentScene !== SCENE_CATCH_MODAL) {
      return;
    }

    // bobber physics
    if (bobber.visible) {
      if (game.mode === "CASTING") {
        bobber.x += bobber.vx * dt;
        bobber.y += bobber.vy * dt;
        bobber.vy += 620 * dt;

        if (bobber.y >= scene.lakeY + 18) {
          bobber.y = scene.lakeY + 18;
          bobber.vx *= 0.12;
          bobber.vy = 0;
          bobber.inWater = true;
          enterWaiting();
        }
      } else if (bobber.inWater) {
        const motionScale = reducedEffects ? 0.35 : 1;
        let amp = (game.mode === "BITE") ? 4.6 : (game.mode === "REELING" ? 2.2 : 1.4);
        let waveSpeed = 1.4 + game.fishPower * 0.7;
        let jiggle = 0;

        if (game.mode === "REELING" && game.reel?.fishAI) {
          const state = game.reel.fishAI.state;
          if (state === "CALM" || state === "REST") {
            amp = 1.4;
            waveSpeed = 1.1 + game.fishPower * 0.5;
          } else if (state === "PULL") {
            amp = 2.3;
            waveSpeed = 1.6 + game.fishPower * 0.8;
          } else if (state === "DASH") {
            amp = 3.4;
            waveSpeed = 2.1 + game.fishPower * 1.1;
          } else if (state === "PANIC") {
            amp = 3.0;
            waveSpeed = 1.8 + game.fishPower * 1.0;
          }
          if (game.reel.telegraphPulse > 0 && !reducedEffects) {
            jiggle = Math.sin(game.t * 45) * 2.8 * (game.reel.telegraphPulse / TELEGRAPH_PULSE);
          }
        }

        bobber.wave += dt * waveSpeed * (reducedEffects ? 0.6 : 1);
        bobber.y = scene.lakeY + 18 + Math.sin(bobber.wave * 6.0) * amp * motionScale + jiggle;
        if (game.mode !== "REELING") {
          bobber.x += Math.sin(bobber.wave * 1.2) * 0.25 * motionScale;
        }
      }
      placeBobberAt(bobber.x, bobber.y);
    }

    if (bobber.inWater && ["WAITING", "BITE"].includes(game.mode)) {
      if (!reducedEffects && scene.t >= nextRippleAt) {
        const boosted = game.mode === "BITE" || scene.t < rippleBoostUntil;
        const interval = boosted ? rand(0.6, 1.1) : rand(2.6, 4.0);
        spawnRipple(boosted ? 1.2 : 1);
        nextRippleAt = scene.t + interval;
      }
    }
    if (!bobber.inWater && ripples.length) {
      ripples.length = 0;
    }
    if (!reducedEffects) {
      updateRipples(dt);
    } else if (ripples.length) {
      ripples.length = 0;
    }

    // state transitions
    if (game.mode === "WAITING") {
      if (game.t >= game.biteAt) enterBite();
    }

    if (game.mode === "BITE") {
      if (game.t > game.biteWindow) {
        game.mode = "IDLE";
        game.t = 0;
        idleHintShown = false;
        bobber.visible = false;
        bobber.inWater = false;
        game.catch = null;
        setFishing(false);
        beep(220, 0.10, 0.05);
        setMsg("Не успел подсечь.", 1.2);
      }
    }

    if (game.mode === "HOOKED") {
      if (game.t > 0.25) startReel();
    }

    if (game.mode === "REELING") {
      const reel = game.reel;
      if (!reel) return;
      const line = getLineStats();
      const zones = reel.zones;
      const weightKg = game.catch?.weightKg || 0;
      const weightPenalty = weightKg > line.maxKg ? (1 + (weightKg - line.maxKg) * 0.05) : 1;

      reel.overload = clamp(reel.overload - dt * 0.6, 0, 1);
      reel.tapFlash = Math.max(0, reel.tapFlash - dt);
      reel.redTick = Math.max(0, reel.redTick - dt);
      reel.slackFlash = Math.max(0, reel.slackFlash - dt);
      reel.telegraphPulse = Math.max(0, reel.telegraphPulse - dt);
      reel.lineBoost = Math.max(0, reel.lineBoost - dt);
      reel.hintCooldown = Math.max(0, reel.hintCooldown - dt);
      reel.slackHintCooldown = Math.max(0, reel.slackHintCooldown - dt);

      const inSweet = game.tension >= zones.sweetMin && game.tension <= zones.sweetMax;
      if (inSweet && reel.tapCadence > 0.18 && reel.tapCadence < 0.6) {
        reel.fatigue = clamp(reel.fatigue + dt * 0.08, 0, 1);
      } else {
        reel.fatigue = clamp(reel.fatigue - dt * 0.12, 0, 1);
      }

      const ai = reel.fishAI;
      if (ai.telegraphTimer > 0) {
        ai.telegraphTimer -= dt;
        if (ai.telegraphTimer <= 0 && ai.pendingState) {
          ai.state = ai.pendingState;
          ai.pendingState = null;
          ai.timer = 0;
          ai.duration = getStateDuration(ai.state, ai.tune, reel.fatigue);
          ai.forceTarget = getStateForceTarget(ai.state, ai.tune, game.fishPower, weightPenalty);
        }
      } else {
        ai.timer += dt;
        if (ai.timer >= ai.duration) {
          const nextState = pickFishState(reel, game.tension, reel.tapCadence);
          if (nextState === "DASH" || nextState === "PULL") {
            ai.pendingState = nextState;
            ai.telegraphDuration = rand(0.15, 0.45) * ai.tune.telegraph;
            ai.telegraphTimer = ai.telegraphDuration;
            reel.telegraphPulse = TELEGRAPH_PULSE;
            reel.lineBoost = 0.4;
            if (reel.hintCooldown <= 0) {
              setHint(nextState === "DASH" ? "Рывок!" : "Тянет!");
              reel.hintCooldown = HINT_COOLDOWN;
            }
            beep(nextState === "DASH" ? 820 : 720, 0.05, 0.05);
          } else {
            ai.state = nextState;
            ai.timer = 0;
            ai.duration = getStateDuration(ai.state, ai.tune, reel.fatigue);
            ai.forceTarget = getStateForceTarget(ai.state, ai.tune, game.fishPower, weightPenalty);
            if (nextState === "REST" && reel.hintCooldown <= 0) {
              setHint("Ослабла…");
              reel.hintCooldown = HINT_COOLDOWN;
            }
          }
        }
      }

      const fatigueMult = inSweet ? lerp(1, 0.7, reel.fatigue) : 1;
      const forceTarget = ai.forceTarget * fatigueMult;
      reel.fishForce = lerp(reel.fishForce, forceTarget, dt * 2.4);

      const relax = 0.14 - game.fishPower * 0.05 + (game.lastTap > 0.7 ? 0.06 : 0.02);
      game.tensionVel += reel.fishForce * dt;
      game.tensionVel -= relax * TENSION_RELAX_MULT * dt;
      game.tensionVel = clamp(game.tensionVel, -1.4, 1.8);
      game.tensionVel *= (0.92 - reel.overload * 0.08);
      game.tension = clamp(game.tension + game.tensionVel * dt, 0, TENSION_MAX);

      const prevSlack = reel.slackRisk;
      if (game.tension < zones.safeMin) {
        const slackRatio = (zones.safeMin - game.tension) / zones.safeMin;
        const accel = slackRatio > 0.6 ? 0.38 : 0.22;
        reel.slackRisk = clamp(reel.slackRisk + dt * (accel + slackRatio * 0.45), 0, 1);
      } else if (inSweet) {
        reel.slackRisk = clamp(reel.slackRisk - dt * 0.28, 0, 1);
      } else {
        reel.slackRisk = clamp(reel.slackRisk - dt * 0.1, 0, 1);
      }
      if (reel.tapCadence > 0.8) {
        reel.slackRisk = clamp(reel.slackRisk + dt * 0.05, 0, 1);
      }
      const slackRise = (reel.slackRisk - prevSlack) / Math.max(0.001, dt);
      if (slackRise > 0.4) reel.slackFlash = 0.25;

      if (game.tension < zones.safeMin) {
        const rollback = dt * 0.02 * (zones.safeMin - game.tension) / zones.safeMin;
        game.progress = Math.max(0, game.progress - rollback);
      }

      const idle01 = clamp((game.lastTap - 0.15) / 0.9, 0, 1);
      const decayZone = getTensionZone(game.tension);
      let decayRate = lerp(PROGRESS_DECAY_ACTIVE, PROGRESS_DECAY_IDLE, idle01);
      if (decayZone === "DANGER") decayRate += PROGRESS_DECAY_DANGER_BONUS;
      game.progress = clamp(game.progress - decayRate * game.need * dt, 0, game.need);

      reel.bobberDrift = 0;
      if (ai.state === "PULL") reel.bobberDrift = W * 0.015;
      if (ai.state === "DASH") reel.bobberDrift = W * 0.025;
      if (ai.state === "PANIC") reel.bobberDrift = W * 0.02;

      const p = clamp(game.progress / game.need, 0, 1);
      bobber.x = lerp(W * 0.78, W * 0.42, p) + reel.bobberDrift;

      revealSystem.update(p);
      const revealHint = revealSystem.getHint();
      setHintTexts(revealHint.weightText, revealHint.speciesText);

      if (game.tension >= line.breakThreshold) {
        game.mode = "IDLE";
        game.t = 0;
        idleHintShown = false;
        bobber.visible = false;
        bobber.inWater = false;
        game.catch = null;
        setFishing(false);
        beep(220, 0.10, 0.05);
        setMsg("Леска лопнула.", 1.3);
        revealSystem.reset();
        scheduleRevealHintHide(260);
        return;
      }
      if (reel.slackRisk >= 1) {
        game.mode = "IDLE";
        game.t = 0;
        idleHintShown = false;
        bobber.visible = false;
        bobber.inWater = false;
        game.catch = null;
        setFishing(false);
        beep(220, 0.10, 0.05);
        setMsg("Слабина! Рыба сорвалась.", 1.3);
        revealSystem.reset();
        scheduleRevealHintHide(260);
        return;
      }

      if (game.progress >= game.need) {
        land();
        return;
      }

      if (reel.slackRisk > 0.7 && reel.slackHintCooldown <= 0) {
        setHint("Слабина!");
        reel.slackHintCooldown = 1.3;
      } else if (reel.hintCooldown <= 0) {
        if (game.tension > zones.dangerMin) {
          setHint("Пауза");
        } else if (game.tension < zones.safeMin) {
          setHint("Ослабь");
        } else if (inSweet) {
          setHint("Жми");
        } else {
          setHint("Ровно");
        }
        reel.hintCooldown = HINT_COOLDOWN;
      }
    }

    if (game.mode === "LANDED") {
      if (game.t > 1.0) {
        game.mode = "IDLE";
        game.t = 0;
        idleHintShown = false;
        bobber.visible = false;
        bobber.inWater = false;
        setFishing(false);
        setHint("Тап: заброс", 1.2);
      }
    }

    if (game.mode === "IDLE" && currentScene === SCENE_LAKE && !idleHintShown && game.t > 5.5) {
      setHint("Тап: заброс", 1.2);
      idleHintShown = true;
    }
  }

  // ===== Drawing =====
  function draw() {
    if (currentScene === SCENE_TRAVEL) {
      drawTravel();
      return;
    }
    if (currentScene === SCENE_CITY || currentScene === SCENE_BUILDING_FISHSHOP || currentScene === SCENE_BUILDING_TROPHY || currentScene === SCENE_BUILDING_GEARSHOP) {
      drawCity();
      return;
    }
    drawLake();
  }

  function drawLake() {
    ctx.clearRect(0, 0, W, H);

    drawWaterSheen();

    if (!reducedEffects && ripples.length) {
      ctx.save();
      ctx.lineWidth = 1;
      for (const ripple of ripples) {
        ctx.strokeStyle = `rgba(205, 228, 255, ${ripple.alpha})`;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    if (bobber.visible) {
      const rodTip = getRodTipPoint();
      if (rodTip) {
        ctx.strokeStyle = "rgba(230,240,255,0.65)";
        const lineBoost = game.mode === "REELING" && game.reel ? game.reel.lineBoost : 0;
        ctx.lineWidth = 1.2 + lineBoost;
        ctx.beginPath();
        ctx.moveTo(rodTip.x, rodTip.y);
        const midX = (rodTip.x + bobber.x) * 0.5;
        const midY = (rodTip.y + bobber.y) * 0.5 + 30;
        ctx.quadraticCurveTo(midX, midY, bobber.x, bobber.y);
        ctx.stroke();
      }
    }

  }

  function drawWaterSheen() {
    if (reducedEffects || !scene.lakeY) return;
    const baseY = scene.lakeY + 12;
    const t = scene.t;
    ctx.save();
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i += 1) {
      const y = baseY + i * 18 + Math.sin(t * 0.6 + i) * 2;
      const grad = ctx.createLinearGradient(0, y, W, y);
      grad.addColorStop(0, "rgba(180,210,235,0)");
      grad.addColorStop(0.25, "rgba(180,210,235,0.18)");
      grad.addColorStop(0.5, "rgba(180,210,235,0.26)");
      grad.addColorStop(0.75, "rgba(180,210,235,0.18)");
      grad.addColorStop(1, "rgba(180,210,235,0)");
      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawTravel() {
    ctx.fillStyle = "#0b1621";
    ctx.fillRect(0, 0, W, H);

    const mapTop = H * 0.2;
    const mapBottom = H * 0.75;
    const mapLeft = W * 0.12;
    const mapRight = W * 0.88;

    ctx.fillStyle = "#0f2232";
    roundRect(mapLeft, mapTop, mapRight - mapLeft, mapBottom - mapTop, 18);
    ctx.fill();

    ctx.strokeStyle = "#5a7899";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(mapLeft + 20, mapBottom - 40);
    ctx.quadraticCurveTo(W * 0.5, mapTop + 30, mapRight - 20, mapBottom - 50);
    ctx.stroke();

    const lakeX = mapLeft + 30;
    const lakeY = mapBottom - 60;
    ctx.fillStyle = "#1d3c58";
    ctx.beginPath();
    ctx.arc(lakeX, lakeY, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#9ad1ff";
    ctx.font = "700 12px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial";
    ctx.fillText("Озеро", lakeX - 20, lakeY - 30);

    const cityX = mapRight - 30;
    const cityY = mapBottom - 70;
    ctx.fillStyle = "#3a5f7a";
    roundRect(cityX - 18, cityY - 18, 36, 36, 8);
    ctx.fill();
    ctx.fillStyle = "#9ad1ff";
    ctx.fillText("Город", cityX - 20, cityY - 30);

    const progress = clamp(travel.t / travel.duration, 0, 1);
    const pathX = lerp(mapLeft + 20, mapRight - 20, progress);
    const pathY = lerp(mapBottom - 40, mapBottom - 50, progress);
    ctx.fillStyle = "#ffd166";
    ctx.beginPath();
    ctx.arc(pathX, pathY, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawCity() {
    ctx.fillStyle = "#0b1621";
    ctx.fillRect(0, 0, W, H);

    const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.5);
    skyGrad.addColorStop(0, "#0a1824");
    skyGrad.addColorStop(1, "#183247");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H * 0.5);

    ctx.fillStyle = "#0f1e2c";
    ctx.fillRect(0, H * 0.5, W, H * 0.5);

    for (const building of cityBuildings) {
      ctx.fillStyle = "#22374d";
      roundRect(building.x, building.y, building.w, building.h, 10);
      ctx.fill();

      ctx.fillStyle = "#314b63";
      ctx.beginPath();
      ctx.moveTo(building.x - 6, building.y + 4);
      ctx.lineTo(building.x + building.w / 2, building.y - 20);
      ctx.lineTo(building.x + building.w + 6, building.y + 4);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#7bd3ff";
      ctx.lineWidth = 2;
      ctx.strokeRect(building.x + 10, building.y + 12, building.w - 20, building.h - 30);

      ctx.fillStyle = "#eaf2ff";
      ctx.font = "700 12px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial";
      ctx.textAlign = "center";
      ctx.fillText(building.label, building.x + building.w / 2, building.y + building.h + 18);
    }
  }

  function drawMeters() {
    const x = W * 0.5;
    const y = scene.lakeY - 120;
    const barW = Math.min(360, W * 0.82);
    const barH = 14;
    const innerW = barW - 4;
    const line = getLineStats();
    const reel = game.reel;
    const zones = reel?.zones || { safeMin: 0.35, sweetMin: 0.48, sweetMax: 0.7, dangerMin: 0.85 };

    const safeMinN = clamp(zones.safeMin / line.breakThreshold, 0, 1);
    const sweetMinN = clamp(zones.sweetMin / line.breakThreshold, 0, 1);
    const sweetMaxN = clamp(zones.sweetMax / line.breakThreshold, 0, 1);
    const dangerMinN = clamp(zones.dangerMin / line.breakThreshold, 0, 1);
    const t = clamp(game.tension / line.breakThreshold, 0, 1);

    // Progress (pulling fish)
    const p = clamp(game.progress / game.need, 0, 1);
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = "#0b0f14";
    roundRect(x - barW / 2, y - barH / 2, barW, barH, 10);
    ctx.fill();

    const aiState = reel?.fishAI?.state;
    const shake = (aiState === "PULL" || aiState === "DASH") ? Math.sin(game.t * 24) * 1.5 : 0;
    const pulse = (aiState === "PULL" || aiState === "DASH") ? 0.08 * Math.abs(Math.sin(game.t * 18)) : 0;

    ctx.globalAlpha = 0.90 - pulse;
    ctx.fillStyle = "#7bd3ff";
    roundRect(x - barW / 2 + 2 + shake, y - barH / 2 + 2, innerW * p, barH - 4, 8);
    ctx.fill();

    if (reel?.tapFlash > 0 && reel.tapFlashType === "green") {
      ctx.globalAlpha = 0.35 * (reel.tapFlash / 0.15);
      ctx.fillStyle = "#e7fff3";
      ctx.fillRect(x - barW / 2 + 2 + shake, y - barH / 2 + 2, innerW * p, barH - 4);
    }

    // Tension bar below
    const ty = y + 24;
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = "#0b0f14";
    roundRect(x - barW / 2, ty - barH / 2, barW, barH, 10);
    ctx.fill();

    // zone background
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = "#d6c278";
    ctx.fillRect(x - barW / 2 + 2 + innerW * safeMinN, ty - barH / 2 + 2, innerW * (sweetMinN - safeMinN), barH - 4);
    ctx.fillRect(x - barW / 2 + 2 + innerW * sweetMaxN, ty - barH / 2 + 2, innerW * (dangerMinN - sweetMaxN), barH - 4);

    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#6fbf93";
    ctx.fillRect(x - barW / 2 + 2 + innerW * sweetMinN, ty - barH / 2 + 2, innerW * (sweetMaxN - sweetMinN), barH - 4);

    ctx.globalAlpha = 0.2;
    ctx.fillStyle = "#c97b7b";
    ctx.fillRect(x - barW / 2 + 2 + innerW * dangerMinN, ty - barH / 2 + 2, innerW * (1 - dangerMinN), barH - 4);

    // tension fill with color
    ctx.globalAlpha = 0.92;
    const color =
      (t >= dangerMinN) ? "#ff6b6b" :
      (t >= sweetMinN && t <= sweetMaxN) ? "#66e6a0" :
      "#ffd166";
    ctx.fillStyle = color;
    roundRect(x - barW / 2 + 2, ty - barH / 2 + 2, innerW * t, barH - 4, 8);
    ctx.fill();

    if (reel?.redTick > 0) {
      ctx.globalAlpha = 0.75 * (reel.redTick / 0.2);
      ctx.fillStyle = "#ff6b6b";
      const markX = x - barW / 2 + 2 + innerW * reel.redTickPos;
      ctx.fillRect(markX - 1, ty - barH / 2 - 6, 2, 6);
    }

    const slackRisk = reel?.slackRisk || 0;
    const slackLabelY = ty + 24;
    const slackBarW = 80;
    const slackBarH = 6;
    const slackX = x - barW / 2;
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#eaf2ff";
    ctx.font = "700 12px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`Срыв: ${Math.round(slackRisk * 100)}%`, slackX, slackLabelY);

    const flashAlpha = reel?.slackFlash > 0 ? 0.4 + 0.4 * Math.abs(Math.sin(game.t * 18)) : 0.4;
    ctx.globalAlpha = 0.35 + flashAlpha * 0.35;
    ctx.fillStyle = "#0b0f14";
    roundRect(slackX + 72, slackLabelY - slackBarH / 2, slackBarW, slackBarH, 4);
    ctx.fill();
    ctx.globalAlpha = 0.8 + flashAlpha * 0.2;
    ctx.fillStyle = slackRisk > 0.7 ? "#ff6b6b" : "#ffd166";
    roundRect(slackX + 72 + 1, slackLabelY - slackBarH / 2 + 1, (slackBarW - 2) * clamp(slackRisk, 0, 1), slackBarH - 2, 3);
    ctx.fill();

    // labels
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#eaf2ff";
    ctx.font = "700 12px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(`Выматывание: ${(p * 100 | 0)}%`, x, y - 12);
    ctx.fillText("Натяжение лески", x, ty - 12);

    ctx.restore();
  }

  function roundRect(x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function loop(t) {
    if (!lastTime) lastTime = t;
    const dt = Math.min(0.033, (t - lastTime) / 1000);
    lastTime = t;

    if (!reducedEffects) {
      const fps = dt > 0 ? 1 / dt : 60;
      if (fps < LOW_FPS_THRESHOLD) {
        lowFpsFrames += 1;
      } else {
        lowFpsFrames = Math.max(0, lowFpsFrames - 1);
      }
      if (lowFpsFrames > 30) {
        applyReducedEffects(true, "low-fps");
      }
    }

    update(dt);
    updateFightHud();
    draw();

    requestAnimationFrame(loop);
  }

  // ===== Service Worker (optional) =====
  // Если не хочешь кеширования — можешь удалить sw.js и блок ниже.
  async function registerSW() {
    try {
      if (!("serviceWorker" in navigator)) return;
      await navigator.serviceWorker.register("./sw.js", { scope: "./" });
    } catch {}
  }

  async function preloadSceneAssets() {
    const images = Array.from(document.images || []);
    const waitFor = (img) =>
      new Promise((resolve) => {
        if (img.complete) return resolve();
        const done = () => resolve();
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      });
    await Promise.all(images.map(waitFor));
  }

  async function boot() {
    showOverlay();
    setOverlayText("Загрузка...");
    if (btnPlay) btnPlay.disabled = true;

    load();
    updateMuteButton();
    updateHUD();
    setVhVar();
    resize();
    renderInventory();
    renderTrashJournal();
    setScene(SCENE_LAKE);
    setLakeState("idle");
    registerSW();

    await preloadSceneAssets();
    syncBobberToRodTip();

    setOverlayText("Тапни «Играть». Управление: тап — заброс, поклёвка → свайп вверх, затем тапами выматывай.");
    setHint("Нажми «Играть».");
    if (btnPlay) btnPlay.disabled = false;

    requestAnimationFrame(loop);
  }

  // ===== Boot =====
  boot();
})();
