(() => {
  const isUi = (t) => t && t.closest && t.closest("#controls, .controls, .hud, button, a, input, textarea, select");
  const inScene = (t) => t && t.closest && (t.closest("#sceneRoot") || t.id === "game" || t.closest("#lakeScene"));
  const kill = (e) => {
    if (!inScene(e.target) || isUi(e.target)) return;
    e.preventDefault();
  };
  const stopDrag = (e) => {
    e.preventDefault();
  };
  document.addEventListener("selectstart", kill, { passive: false });
  document.addEventListener("dragstart", stopDrag, { passive: false });
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
  const gameLayer = document.getElementById("gameLayer");
  const uiLayer = document.getElementById("uiLayer");
  const modalLayer = document.getElementById("modalLayer");
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d", { alpha: true });
  const lakeScene = document.getElementById("lakeScene");
  const heroLayer = document.getElementById("heroLayer");
  const rodLayer = document.getElementById("rodLayer");
  const bobberLayer = document.getElementById("bobberLayer");

  const coinsEl = document.getElementById("coins");
  const profileLevelBadge = document.getElementById("profileLevelBadge");
  const hintToast = document.getElementById("hintToast");

  const overlay = document.getElementById("overlay");
  const ovText = document.getElementById("ovText");
  const btnPlay = document.getElementById("btnPlay");
  const btnReset = document.getElementById("btnReset");
  const btnMute = document.getElementById("btnMute");
  const btnStar = document.getElementById("btnStar");
  const btnProfile = document.getElementById("btnProfile");
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
  const trashFoundCount = document.getElementById("trashFoundCount");
  const trashFoundTotal = document.getElementById("trashFoundTotal");
  const trashRewardLineProgress = document.getElementById("trashRewardLineProgress");
  const trashRewardLineComplete = document.getElementById("trashRewardLineComplete");
  const trashProgressFill = document.getElementById("trashProgressFill");
  const btnTrashFill = document.getElementById("btnTrashFill");
  const btnResetCharges = document.getElementById("btnResetCharges");

  const catchOverlay = document.getElementById("catchOverlay");
  const catchTitle = document.getElementById("catchTitle");
  const catchName = document.getElementById("catchName");
  const catchRarity = document.getElementById("catchRarity");
  const catchWeight = document.getElementById("catchWeight");
  const catchStory = document.getElementById("catchStory");
  const catchImageSlot = document.getElementById("catchImageSlot");
  const catchImage = document.getElementById("catchImage");
  const catchFullPrice = document.getElementById("catchFullPrice");
  const catchDiscountPrice = document.getElementById("catchDiscountPrice");
  const catchTrophyWrap = document.getElementById("catchTrophyWrap");
  const catchTrophyToggle = document.getElementById("catchTrophyToggle");
  const btnCatchKeep = document.getElementById("btnCatchKeep");
  const btnCatchSellNow = document.getElementById("btnCatchSellNow");

  const findingOverlay = document.getElementById("findingOverlay");
  const findingTitle = document.getElementById("findingTitle");
  const findingName = document.getElementById("findingName");
  const findingImageSlot = document.getElementById("findingImageSlot");
  const findingImage = document.getElementById("findingImage");
  const findingStory = document.getElementById("findingStory");
  const btnFindingContinue = document.getElementById("btnFindingContinue");
  const btnFindingJournal = document.getElementById("btnFindingJournal");

  const travelOverlay = document.getElementById("travelOverlay");
  const travelTimer = document.getElementById("travelTimer");
  const travelMessage = document.getElementById("travelMessage");
  const travelPathBase = document.getElementById("travelPathBase");
  const travelPathProgress = document.getElementById("travelPathProgress");
  const travelMarker = document.getElementById("travelMarker");
  const travelCard = document.querySelector(".travelCard");

  const cityHud = document.getElementById("cityHud");
  const btnBackToLake = document.getElementById("btnBackToLake");
  const cityScene = document.getElementById("cityScene");
  const cityHitboxes = Array.from(document.querySelectorAll(".city-hitbox"));
  const cityTooltip = document.getElementById("cityTooltip");
  const questReminder = document.getElementById("questReminder");
  const rotateOverlay = document.getElementById("rotateOverlay");

  const setButtonText = (button, text) => {
    if (!button) return;
    let textNode = button.querySelector(".btnText");
    if (!textNode) {
      button.textContent = "";
      textNode = document.createElement("span");
      textNode.className = "btnText";
      button.appendChild(textNode);
    }
    textNode.textContent = text;
  };

  const shopOverlay = document.getElementById("shopOverlay");
  const shopTitle = document.getElementById("shopTitle");
  const btnShopClose = document.getElementById("btnShopClose");
  const shopStats = document.getElementById("shopStats");
  const fishShopSection = document.getElementById("fishShopSection");
  const shopInvList = document.getElementById("shopInvList");
  const shopInvEmpty = document.getElementById("shopInvEmpty");
  const btnSellAll = document.getElementById("btnSellAll");
  const trophyQuestSection = document.getElementById("trophyQuestSection");
  const trophyActiveSection = document.getElementById("trophyActiveSection");
  const difficultyButtons = Array.from(document.querySelectorAll(".difficultyBtn"));
  const questPreviewSpecies = document.getElementById("questPreviewSpecies");
  const questPreviewWeight = document.getElementById("questPreviewWeight");
  const questPreviewReward = document.getElementById("questPreviewReward");
  const btnQuestAccept = document.getElementById("btnQuestAccept");
  const btnQuestRefresh = document.getElementById("btnQuestRefresh");
  const questRefreshStatus = document.getElementById("questRefreshStatus");
  const activeQuestSpecies = document.getElementById("activeQuestSpecies");
  const activeQuestWeight = document.getElementById("activeQuestWeight");
  const activeQuestReward = document.getElementById("activeQuestReward");
  const activeQuestStatus = document.getElementById("activeQuestStatus");
  const btnQuestClaim = document.getElementById("btnQuestClaim");
  const gearShopSection = document.getElementById("gearShopSection");
  const gearTabButtons = Array.from(document.querySelectorAll(".gearTabBtn"));
  const gearTabPanels = Array.from(document.querySelectorAll(".gearTabPanel"));
  const baitList = document.getElementById("baitList");
  const rodList = document.getElementById("rodList");
  const lineList = document.getElementById("lineList");
  const leaderboardOverlay = document.getElementById("leaderboardOverlay");
  const btnLeaderboardClose = document.getElementById("btnLeaderboardClose");

  const profileOverlay = document.getElementById("profileOverlay");
  const btnProfileClose = document.getElementById("btnProfileClose");
  const profileName = document.getElementById("profileName");
  const btnProfileRename = document.getElementById("btnProfileRename");
  const profileXpRing = document.getElementById("profileXpRing");
  const btnProfileStatsOpen = document.getElementById("btnProfileStatsOpen");
  const btnProfileLeaderboardsOpen = document.getElementById("btnProfileLeaderboardsOpen");
  const btnProfileStatsBack = document.getElementById("btnProfileStatsBack");
  const btnProfileStatsClose = document.getElementById("btnProfileStatsClose");
  const profileScreenMain = document.getElementById("profileScreenMain");
  const profileScreenStats = document.getElementById("profileScreenStats");
  const profileScreenGear = document.getElementById("profileScreenGear");
  const btnProfileGearClose = document.getElementById("btnProfileGearClose");
  const statPlayTime = document.getElementById("statPlayTime");
  const statFishCaught = document.getElementById("statFishCaught");
  const statGoldEarned = document.getElementById("statGoldEarned");
  const statBestRarity = document.getElementById("statBestRarity");
  const statMaxWeight = document.getElementById("statMaxWeight");
  const profileRodName = document.getElementById("profileRodName");
  const profileLineName = document.getElementById("profileLineName");
  const profileBaitName = document.getElementById("profileBaitName");
  const profileGearTitle = document.getElementById("profileGearTitle");
  const profileGearPickerList = document.getElementById("profileGearPickerList");
  const btnProfileGearBack = document.getElementById("btnProfileGearBack");
  const profileGearToggles = Array.from(document.querySelectorAll(".profileGearToggle"));

  const renameOverlay = document.getElementById("renameOverlay");
  const btnRenameClose = document.getElementById("btnRenameClose");
  const renameInput = document.getElementById("renameInput");
  const renameFreeHint = document.getElementById("renameFreeHint");
  const renameError = document.getElementById("renameError");
  const btnRenameSave = document.getElementById("btnRenameSave");
  const renameScreenMain = document.getElementById("renameScreenMain");
  const renameScreenConfirm = document.getElementById("renameScreenConfirm");
  const renameConfirmText = document.getElementById("renameConfirmText");
  const btnRenameConfirmBack = document.getElementById("btnRenameConfirmBack");
  const btnRenameConfirmSave = document.getElementById("btnRenameConfirmSave");

  const profileSetupOverlay = document.getElementById("profileSetupOverlay");
  const profileSetupSuggested = document.getElementById("profileSetupSuggested");
  const profileSetupInput = document.getElementById("profileSetupInput");
  const profileSetupError = document.getElementById("profileSetupError");
  const profileSetupCustomPanel = document.getElementById("profileSetupCustomPanel");
  const btnProfileSetupAccept = document.getElementById("btnProfileSetupAccept");
  const btnProfileSetupCustom = document.getElementById("btnProfileSetupCustom");
  const btnProfileSetupSave = document.getElementById("btnProfileSetupSave");

  const leaderboardTabButtons = Array.from(document.querySelectorAll(".leaderboardTabBtn"));
  const leaderboardYourRecord = document.getElementById("leaderboardYourRecord");
  const leaderboardLocalList = document.getElementById("leaderboardLocalList");
  const trophySection = document.getElementById("trophySection");
  const trophyHub = document.getElementById("trophyHub");
  const trophyQuestPanel = document.getElementById("trophyQuestPanel");
  const btnTrophyQuests = document.getElementById("btnTrophyQuests");
  const btnTrophyRecords = document.getElementById("btnTrophyRecords");
  const btnTrophyBack = document.getElementById("btnTrophyBack");

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

  // Fix for accidental scene -> shop routing: isolate UI/game layers and stop UI click bubbling.
  const stopUiEvent = (event) => {
    if (!event) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  };

  const stopModalEvent = (event) => {
    if (!modalLayer?.classList.contains("is-active")) return;
    event.stopPropagation();
    if (event.target instanceof HTMLElement && event.target.classList.contains("modal")) {
      event.preventDefault();
    }
  };

  const guardUiClick = (event) => {
    if (event?.target?.closest?.("button")) {
      stopUiEvent(event);
    }
  };

  uiLayer?.addEventListener("pointerdown", guardUiClick);
  uiLayer?.addEventListener("click", guardUiClick);
  modalLayer?.addEventListener("pointerdown", guardUiClick);
  modalLayer?.addEventListener("click", guardUiClick);
  modalLayer?.addEventListener("pointerdown", stopModalEvent);
  modalLayer?.addEventListener("click", stopModalEvent);
  modalLayer?.addEventListener("focusin", handleModalBodyFocus);
  modalLayer?.addEventListener("touchmove", handleModalTouchMove, { passive: false });

  const blockTravelInteraction = (event) => {
    if (!travel.active) return;
    stopUiEvent(event);
  };

  travelOverlay?.addEventListener("pointerdown", blockTravelInteraction, { passive: false });
  travelOverlay?.addEventListener("pointerup", blockTravelInteraction, { passive: false });
  travelOverlay?.addEventListener("click", blockTravelInteraction, { passive: false });
  travelOverlay?.addEventListener("touchstart", blockTravelInteraction, { passive: false });
  travelOverlay?.addEventListener("touchmove", blockTravelInteraction, { passive: false });

  window.addEventListener("resize", updateVvh);
  updateVvh();

  const blockingOverlays = [
    overlay,
    invOverlay,
    trashOverlay,
    catchOverlay,
    findingOverlay,
    profileSetupOverlay,
    profileOverlay,
    renameOverlay,
    travelOverlay,
    shopOverlay,
    leaderboardOverlay,
    rotateOverlay,
    sceneFade
  ];

  const scrollFreezeState = {
    active: false,
    scrollY: 0,
    style: {}
  };

  function updateVvh() {
    const v = window.visualViewport;
    const height = v ? v.height : window.innerHeight;
    const top = v ? v.offsetTop : 0;
    document.documentElement.style.setProperty("--vvh", `${height * 0.01}px`);
    document.documentElement.style.setProperty("--vv-top", `${top}px`);
    document.documentElement.style.setProperty("--modal-viewport-height", `${height}px`);
  }

  let renameViewportHandlersActive = false;

  function updateRenameViewportInsets() {
    const vv = window.visualViewport;
    const keyboardInset = vv ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop) : 0;
    if (modalLayer) {
      modalLayer.style.setProperty("--modal-keyboard-inset", `${keyboardInset}px`);
    }
    updateVvh();
  }

  function enableRenameViewportHandlers() {
    if (renameViewportHandlersActive) return;
    renameViewportHandlersActive = true;
    updateRenameViewportInsets();
    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", updateRenameViewportInsets);
      vv.addEventListener("scroll", updateRenameViewportInsets);
    }
    window.addEventListener("resize", updateRenameViewportInsets);
  }

  function disableRenameViewportHandlers() {
    if (!renameViewportHandlersActive) return;
    renameViewportHandlersActive = false;
    const vv = window.visualViewport;
    if (vv) {
      vv.removeEventListener("resize", updateRenameViewportInsets);
      vv.removeEventListener("scroll", updateRenameViewportInsets);
    }
    window.removeEventListener("resize", updateRenameViewportInsets);
    if (modalLayer) {
      modalLayer.style.removeProperty("--modal-keyboard-inset");
    }
    updateVvh();
  }

  function freezePageScroll() {
    if (scrollFreezeState.active) return;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    scrollFreezeState.scrollY = scrollY;
    const bodyStyle = document.body.style;
    const htmlStyle = document.documentElement.style;
    scrollFreezeState.style = {
      position: bodyStyle.position,
      top: bodyStyle.top,
      left: bodyStyle.left,
      right: bodyStyle.right,
      width: bodyStyle.width,
      overflow: bodyStyle.overflow,
      touchAction: bodyStyle.touchAction,
      htmlOverflow: htmlStyle.overflow
    };
    bodyStyle.position = "fixed";
    bodyStyle.top = `-${scrollY}px`;
    bodyStyle.left = "0";
    bodyStyle.right = "0";
    bodyStyle.width = "100%";
    bodyStyle.overflow = "hidden";
    bodyStyle.touchAction = "none";
    htmlStyle.overflow = "hidden";
    document.body.classList.add("modalOpen");
    scrollFreezeState.active = true;
  }

  function unfreezePageScroll() {
    if (!scrollFreezeState.active) return;
    const bodyStyle = document.body.style;
    const htmlStyle = document.documentElement.style;
    const prev = scrollFreezeState.style;
    bodyStyle.position = prev.position || "";
    bodyStyle.top = prev.top || "";
    bodyStyle.left = prev.left || "";
    bodyStyle.right = prev.right || "";
    bodyStyle.width = prev.width || "";
    bodyStyle.overflow = prev.overflow || "";
    bodyStyle.touchAction = prev.touchAction || "";
    htmlStyle.overflow = prev.htmlOverflow || "";
    window.scrollTo(0, scrollFreezeState.scrollY || 0);
    document.body.classList.remove("modalOpen");
    scrollFreezeState.active = false;
  }

  function relayoutModalToViewport() {
    updateVvh();
  }

  function updateModalLayerState() {
    if (!modalLayer) return;
    const hasBlocking = blockingOverlays.some((el) => el && !el.classList.contains("hidden"));
    modalLayer.classList.toggle("is-active", hasBlocking);
    uiLayer?.classList.toggle("is-blocked", hasBlocking);
    if (hasBlocking) {
      freezePageScroll();
    } else {
      unfreezePageScroll();
      blurActiveInput();
      if (canvas?.focus) {
        requestAnimationFrame(() => canvas.focus());
      }
    }
    updateVvh();
  }

  function blurActiveInput() {
    const active = document.activeElement;
    if (active && active instanceof HTMLElement && active.blur) {
      active.blur();
    }
  }

  function showRenameScreen(screen) {
    const screens = {
      main: renameScreenMain,
      confirm: renameScreenConfirm
    };
    Object.entries(screens).forEach(([key, el]) => {
      if (!el) return;
      el.classList.toggle("hidden", key !== screen);
    });
  }

  function openRenameModal({ returnToProfile = false } = {}) {
    if (!renameOverlay || !canRenameProfile()) return;
    renameReturnToProfile = returnToProfile;
    if (returnToProfile) {
      profileOverlay?.classList.add("hidden");
      profileOverlay?.setAttribute("aria-hidden", "true");
    }
    renameOverlay.classList.remove("hidden");
    renameOverlay.setAttribute("aria-hidden", "false");
    showRenameScreen("main");
    if (renameFreeHint) renameFreeHint.textContent = "Первый раз — бесплатно.";
    setProfileError(renameError, "");
    if (renameInput) {
      renameInput.value = profile?.nickname || "";
      requestAnimationFrame(() => renameInput.focus());
    }
    enableRenameViewportHandlers();
    freezePageScroll();
    updateModalLayerState();
    requestAnimationFrame(() => relayoutModalToViewport());
  }

  function closeRenameModal({ returnToProfileOverride } = {}) {
    renameOverlay?.classList.add("hidden");
    renameOverlay?.setAttribute("aria-hidden", "true");
    setProfileError(renameError, "");
    pendingRename = null;
    blurActiveInput();
    disableRenameViewportHandlers();
    updateModalLayerState();
    const shouldReturn = returnToProfileOverride ?? renameReturnToProfile;
    renameReturnToProfile = false;
    if (shouldReturn) {
      openProfile();
    }
  }

  function scrollIntoModalBody(target) {
    const body = target.closest(".modalBody");
    if (!body) return;
    const bodyRect = body.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const offsetTop = targetRect.top - bodyRect.top + body.scrollTop;
    const targetCenter = offsetTop + targetRect.height / 2;
    const nextScrollTop = Math.max(0, Math.min(body.scrollHeight - body.clientHeight, targetCenter - body.clientHeight / 2));
    body.scrollTo({ top: nextScrollTop, behavior: "auto" });
  }

  function handleModalBodyFocus(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const body = target.closest(".modalBody");
    if (!body) return;
    requestAnimationFrame(() => {
      updateVvh();
      scrollIntoModalBody(target);
    });
  }

  function handleModalTouchMove(event) {
    if (!(event.target instanceof HTMLElement)) return;
    if (event.target.closest(".modalBody")) return;
    event.preventDefault();
  }

  // ===== Helpers =====
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const randomInt = (min, max) => Math.floor(rand(min, max + 1));

  const GEAR_UNLOCK_LEVELS = {
    rods: { 1: 1, 2: 3, 3: 6 },
    lines: { 1: 1, 2: 4, 3: 7 },
    baits: {
      worm: 1,
      "sweet-dough": 2,
      minnow: 3,
      spinner: 4,
      "deep-lure": 6
    }
  };

  const BITE_DELAY_RANGE_MS = { min: 5000, max: 10000 };
  const CAUGHT_SPECIES_KEY = "caughtSpeciesSet";
  const fishIdAliases = {
    roach: "plotva",
    perch: "okun",
    crucian: "karas_serebryanyy",
    bream: "lesh",
    pike: "shchuka",
    zander: "sudak",
    trout: "forel_raduzhnaya",
    catfish: "som",
    sturgeon: "osetr",
    "moon-legend": "pozhiratel_lunok"
  };

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

  function normalizeSpeciesId(value) {
    if (!value) return value;
    return fishIdAliases[value] || value;
  }

  function readCaughtSpecies() {
    try {
      const raw = localStorage.getItem(CAUGHT_SPECIES_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      const normalized = new Set();
      let changed = false;
      (Array.isArray(parsed) ? parsed : []).forEach((entry) => {
        const normalizedId = normalizeSpeciesId(entry);
        if (normalizedId) normalized.add(normalizedId);
        if (normalizedId !== entry) changed = true;
      });
      if (changed) {
        writeCaughtSpecies(normalized);
      }
      return normalized;
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
  const formatChancePercent = (value) => {
    if (!Number.isFinite(value)) return "—";
    const percent = value * 100;
    let digits = 0;
    if (percent > 0 && percent < 1) {
      digits = 2;
    } else if (percent < 10) {
      digits = 1;
    }
    return `${percent.toFixed(digits)}%`;
  };
  const formatWeightFromGrams = (grams) => {
    const kg = Math.max(0, Number(grams) || 0) / 1000;
    return `${kg.toFixed(2)} кг`;
  };
  const formatItemWeight = (item) => {
    if (!item) return formatKg(0);
    const grams = Number(item.weightG);
    if (Number.isFinite(grams) && grams > 0) return formatWeightFromGrams(grams);
    return formatKg(Number(item.weightKg) || 0);
  };
  const formatCoins = (value) => `${value} монет`;
  const formatDuration = (ms) => {
    const total = Math.max(0, Math.ceil(ms / 1000));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };
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
  let cityTooltipTimer = null;
  let cityTooltipHideTimer = null;

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

  let isFighting = false;

  function setUiLocked(isLocked) {
    const lockTargets = [
      btnCity,
      btnInventory,
      btnJournal,
      btnStar,
      btnMute,
      btnProfile,
      btnBackToLake,
      btnProfileStatsOpen,
      btnProfileLeaderboardsOpen,
      btnTrophyQuests,
      btnTrophyRecords,
      btnTrophyBack
    ];
    const extraTargets = Array.from(document.querySelectorAll(".navBtn, .hudBtn, .openModalBtn"));
    const applyLock = (el) => {
      if (!el) return;
      const isButton = el.tagName === "BUTTON";
      if (isButton) {
        el.disabled = isLocked;
      } else {
        el.style.pointerEvents = isLocked ? "none" : "";
      }
      el.classList.toggle("isDisabled", isLocked);
    };
    lockTargets.concat(extraTargets, cityHitboxes).forEach(applyLock);
    if (cityScene) {
      cityScene.style.pointerEvents = isLocked ? "none" : "";
    }
  }

  function setFightState(nextState) {
    if (isFighting === nextState) return;
    isFighting = nextState;
    setUiLocked(isFighting);
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

  let safeAreaProbe = null;

  function getSafeAreaInsets() {
    if (!safeAreaProbe) {
      safeAreaProbe = document.createElement("div");
      safeAreaProbe.style.position = "fixed";
      safeAreaProbe.style.top = "0";
      safeAreaProbe.style.left = "0";
      safeAreaProbe.style.width = "0";
      safeAreaProbe.style.height = "0";
      safeAreaProbe.style.padding = "env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)";
      safeAreaProbe.style.pointerEvents = "none";
      safeAreaProbe.style.visibility = "hidden";
      document.body.appendChild(safeAreaProbe);
    }
    const style = getComputedStyle(safeAreaProbe);
    return {
      top: Number.parseFloat(style.paddingTop) || 0,
      right: Number.parseFloat(style.paddingRight) || 0,
      bottom: Number.parseFloat(style.paddingBottom) || 0,
      left: Number.parseFloat(style.paddingLeft) || 0
    };
  }

  function getGameViewportRect() {
    const appRect = app?.getBoundingClientRect() || document.documentElement.getBoundingClientRect();
    const vv = window.visualViewport;
    const w = vv?.width ?? appRect.width;
    const h = vv?.height ?? appRect.height;
    const ox = vv?.offsetLeft ?? 0;
    const oy = vv?.offsetTop ?? 0;
    const safe = getSafeAreaInsets();
    return {
      x: appRect.left + ox,
      y: appRect.top + oy,
      w,
      h,
      safeTopPx: safe.top,
      safeBottomPx: safe.bottom,
      safeLeftPx: safe.left,
      safeRightPx: safe.right
    };
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

  let orientationLocked = false;
  let orientationPauseStarted = null;
  let pendingOrientationPause = 0;
  const orientationQuery = window.matchMedia?.("(orientation: landscape)");

  function isLandscapeOrientation() {
    const match = window.matchMedia?.("(orientation: landscape)");
    return (match && match.matches) || (window.innerWidth > window.innerHeight);
  }

  function showRotateOverlay() {
    if (!rotateOverlay) return;
    rotateOverlay.classList.remove("hidden");
    rotateOverlay.style.display = "flex";
    rotateOverlay.style.pointerEvents = "auto";
    rotateOverlay.setAttribute("aria-hidden", "false");
    updateModalLayerState();
  }

  function hideRotateOverlay() {
    if (!rotateOverlay) return;
    rotateOverlay.classList.add("hidden");
    rotateOverlay.style.display = "none";
    rotateOverlay.style.pointerEvents = "none";
    rotateOverlay.setAttribute("aria-hidden", "true");
    updateModalLayerState();
  }

  function disableGameInput() {
    if (gameLayer) {
      gameLayer.style.pointerEvents = "none";
    }
    if (uiLayer) {
      uiLayer.style.pointerEvents = "none";
    }
  }

  function enableGameInput() {
    if (gameLayer) {
      gameLayer.style.pointerEvents = "auto";
    }
    if (uiLayer) {
      uiLayer.style.pointerEvents = "";
    }
  }

  function updateOrientationLock() {
    const shouldLock = isLandscapeOrientation();
    orientationLocked = shouldLock;
    if (app) app.classList.toggle("orientation-locked", shouldLock);
    if (shouldLock) {
      showRotateOverlay();
      disableGameInput();
      if (orientationPauseStarted === null) {
        orientationPauseStarted = Date.now();
      }
      return;
    }
    hideRotateOverlay();
    enableGameInput();
    if (orientationPauseStarted !== null) {
      pendingOrientationPause += Date.now() - orientationPauseStarted;
      orientationPauseStarted = null;
    }
    layout();
  }

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

  function showQuestToast(title, subtitle) {
    if (!toast) return;
    toast.innerHTML = `
      <div class="toastTitle">${title}</div>
      <div class="toastSub">${subtitle}</div>
    `;
    toast.classList.remove("hidden");
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.classList.add("hidden"), 200);
    }, 1300);
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
  const SCENE_FINDING_MODAL = "SCENE_FINDING_MODAL";
  const SCENE_CITY = "SCENE_CITY";
  const SCENE_BUILDING_FISHSHOP = "SCENE_BUILDING_FISHSHOP";
  const SCENE_BUILDING_TROPHY = "SCENE_BUILDING_TROPHY";
  const SCENE_BUILDING_GEARSHOP = "SCENE_BUILDING_GEARSHOP";

  // ===== Fish table =====
  const fishIcons = {
    som: "assets/fish/som.png",
    forel_raduzhnaya: "assets/fish/forel_raduzhnaya.png",
    sudak: "assets/fish/sudak.png",
    plotva: "assets/fish/plotva.png",
    okun: "assets/fish/okun.png",
    shchuka: "assets/fish/shchuka.png",
    lesh: "assets/fish/lesh.png",
    karas_serebryanyy: "assets/fish/karas.png",
    osetr: "assets/fish/osetr.png",
    pozhiratel_lunok: "assets/fish/pozhiratel_lunok.png"
  };

  const fishSpeciesTable = [
    {
      id: "plotva",
      name: "Плотва",
      rarity: "common",
      chance: 0.3,
      minKg: 0.1,
      maxKg: 1.2,
      modeKg: 0.35,
      pricePerKg: 45,
      story: "Серебристая тень у кромки льда. Говорят, плотва первая проверяет приманку и первая же выдаёт рыбака.",
      minRodTier: 1,
      icon: fishIcons.plotva
    },
    {
      id: "okun",
      name: "Окунь",
      rarity: "common",
      chance: 0.22,
      minKg: 0.15,
      maxKg: 2.0,
      modeKg: 0.6,
      pricePerKg: 55,
      story: "Полосатый разбойник. Часто идёт стаей и любит короткие резкие рывки.",
      minRodTier: 1,
      icon: fishIcons.okun
    },
    {
      id: "karas_serebryanyy",
      name: "Карась",
      rarity: "common",
      chance: 0.16,
      minKg: 0.2,
      maxKg: 3.5,
      modeKg: 1.0,
      pricePerKg: 50,
      story: "Упрямый и терпеливый. Старики говорят: карась клюёт тогда, когда ты уже почти ушёл.",
      minRodTier: 1,
      icon: fishIcons.karas_serebryanyy
    },
    {
      id: "lesh",
      name: "Лещ",
      rarity: "uncommon",
      chance: 0.09,
      minKg: 0.5,
      maxKg: 6.0,
      modeKg: 1.8,
      pricePerKg: 70,
      story: "Тяжёлый, ‘плоский’ и молчаливый. Вытаскивать его — как поднимать мокрую доску.",
      minRodTier: 1,
      icon: fishIcons.lesh
    },
    {
      id: "shchuka",
      name: "Щука",
      rarity: "uncommon",
      chance: 0.12,
      minKg: 0.7,
      maxKg: 12.0,
      modeKg: 3.0,
      pricePerKg: 85,
      story: "Северная торпеда. Может стоять неподвижно минутами, а потом ударить как молния.",
      minRodTier: 1,
      icon: fishIcons.shchuka
    },
    {
      id: "sudak",
      name: "Судак",
      rarity: "rare",
      chance: 0.06,
      minKg: 0.8,
      maxKg: 8.0,
      modeKg: 2.5,
      pricePerKg: 95,
      story: "Ночной охотник. У него холодный взгляд и характер — будто лёд под сапогом.",
      minRodTier: 2,
      icon: fishIcons.sudak
    },
    {
      id: "forel_raduzhnaya",
      name: "Форель",
      rarity: "rare",
      chance: 0.03,
      minKg: 0.4,
      maxKg: 5.0,
      modeKg: 1.5,
      pricePerKg: 120,
      story: "Чистая вода, быстрые струи. Форель будто создана для побега — её надо ‘переиграть’.",
      minRodTier: 2,
      icon: fishIcons.forel_raduzhnaya
    },
    {
      id: "som",
      name: "Сом",
      rarity: "epic",
      chance: 0.015,
      minKg: 1.0,
      maxKg: 30.0,
      modeKg: 6.0,
      pricePerKg: 140,
      story: "Дно его дом. Если сом клюнул — ты почувствуешь, как будто за леску держится сама глубина.",
      minRodTier: 2,
      icon: fishIcons.som
    },
    {
      id: "osetr",
      name: "Осётр",
      rarity: "epic",
      chance: 0.0045,
      minKg: 2.0,
      maxKg: 60.0,
      modeKg: 10.0,
      pricePerKg: 220,
      story: "Реликт прошлого. Осётр — рыба, которая помнит ‘до льда’, и не любит торопливых.",
      minRodTier: 3,
      icon: fishIcons.osetr
    },
    {
      id: "pozhiratel_lunok",
      name: "Пожиратель лунок",
      rarity: "legendary",
      chance: 0.0005,
      minKg: 5.0,
      maxKg: 25.0,
      modeKg: 12.0,
      pricePerKg: 600,
      story: "Её видели единицы. Говорят, она выходит на свет луны и берёт приманку только у тех, кто умеет ждать.",
      minRodTier: 3,
      icon: fishIcons.pozhiratel_lunok
    }
  ];

  const FISH_WEIGHT_LIMITS = {
    plotva: { min: 0.1, max: 1.2 },
    okun: { min: 0.15, max: 2.0 },
    karas_serebryanyy: { min: 0.2, max: 3.5 },
    lesh: { min: 0.5, max: 6.0 },
    shchuka: { min: 0.7, max: 12.0 },
    sudak: { min: 0.8, max: 8.0 },
    forel_raduzhnaya: { min: 0.4, max: 5.0 },
    som: { min: 1.0, max: 30.0 },
    osetr: { min: 2.0, max: 60.0 },
    pozhiratel_lunok: { min: 5.0, max: 25.0 }
  };

  const QUEST_DIFFICULTIES = {
    easy: {
      label: "Лёгкое",
      rangePct: 0.55,
      minWidth: 0.35,
      rewardMult: 0.75,
      xpMult: 1.0,
      rarityPool: ["common", "uncommon"]
    },
    medium: {
      label: "Среднее",
      rangePct: 0.35,
      minWidth: 0.25,
      rewardMult: 1.0,
      xpMult: 1.35,
      rarityPool: ["common", "uncommon", "rare"]
    },
    hard: {
      label: "Сложное",
      rangePct: 0.2,
      minWidth: 0.18,
      rewardMult: 1.35,
      xpMult: 1.8,
      rarityPool: ["rare", "epic", "legendary"]
    }
  };

  const QUEST_DIFFICULTY_KEYS = ["easy", "medium", "hard"];
  const QUEST_REFRESH_COOLDOWNS = [10_000, 60_000, 600_000, 3_600_000];
  const QUEST_COMPLETION_COOLDOWNS = {
    easy: 10 * 60 * 1000,
    medium: 30 * 60 * 1000,
    hard: 60 * 60 * 1000
  };

  const confusionGroups = [
    ["plotva", "karas_serebryanyy", "lesh"],
    ["okun", "sudak"],
    ["shchuka", "forel_raduzhnaya"],
    ["som", "osetr"]
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
      unlockLevel: GEAR_UNLOCK_LEVELS.baits.worm,
      boost: ["plotva", "okun", "karas_serebryanyy"],
      note: "Любимый запах спокойной рыбы."
    },
    {
      id: "sweet-dough",
      name: "Сладкое тесто",
      price: 22,
      unlockLevel: GEAR_UNLOCK_LEVELS.baits["sweet-dough"],
      boost: ["karas_serebryanyy", "lesh"],
      note: "Тягучая приманка для любителей лакомства."
    },
    {
      id: "minnow",
      name: "Малёк",
      price: 30,
      unlockLevel: GEAR_UNLOCK_LEVELS.baits.minnow,
      boost: ["shchuka", "sudak"],
      note: "Хищники охотятся охотно."
    },
    {
      id: "spinner",
      name: "Блесна-вертушка",
      price: 36,
      unlockLevel: GEAR_UNLOCK_LEVELS.baits.spinner,
      boost: ["forel_raduzhnaya", "sudak"],
      note: "Шумит и бликует в воде."
    },
    {
      id: "deep-lure",
      name: "Глубинная приманка",
      price: 48,
      unlockLevel: GEAR_UNLOCK_LEVELS.baits["deep-lure"],
      boost: ["som", "osetr", "pozhiratel_lunok"],
      note: "Для тех, кто ищет редкие виды."
    }
  ];

  const rodItems = [
    { id: 1, name: "Rod_1 «Базовая»", price: 0, unlockLevel: GEAR_UNLOCK_LEVELS.rods[1], reelBonus: 0.0, safeZoneBonus: 0, rareBonus: 0 },
    { id: 2, name: "Rod_2 «Контроль»", price: 280, unlockLevel: GEAR_UNLOCK_LEVELS.rods[2], reelBonus: 0.03, safeZoneBonus: 0.1, rareBonus: 0 },
    { id: 3, name: "Rod_3 «Охотник»", price: 680, unlockLevel: GEAR_UNLOCK_LEVELS.rods[3], reelBonus: 0.05, safeZoneBonus: 0, rareBonus: 0.07 }
  ];

  const lineItems = [
    { id: 1, name: "Line_1 «Базовая»", price: 0, unlockLevel: GEAR_UNLOCK_LEVELS.lines[1], breakThreshold: 1.0, maxKg: 4.5, tensionMult: 1.0, breakRiskMod: 1, rareBonus: 0 },
    { id: 2, name: "Line_2 «Крепкая»", price: 220, unlockLevel: GEAR_UNLOCK_LEVELS.lines[2], breakThreshold: 1.12, maxKg: 9, tensionMult: 0.92, breakRiskMod: 1.07, rareBonus: 0 },
    { id: 3, name: "Line_3 «Тонкая»", price: 540, unlockLevel: GEAR_UNLOCK_LEVELS.lines[3], breakThreshold: 1.22, maxKg: 18, tensionMult: 0.86, breakRiskMod: 0.95, rareBonus: 0.05 }
  ];

  function isUnlocked(item, level = player.playerLevel) {
    return level >= (item?.unlockLevel ?? 1);
  }

  function getFirstUnlockedItem(items, level = player.playerLevel) {
    return items.find((item) => isUnlocked(item, level)) || items[0];
  }

  function enforceGearUnlocks() {
    let changed = false;
    const level = player.playerLevel;
    const activeRod = rodItems.find((rod) => rod.id === player.rodTier);
    const activeLine = lineItems.find((line) => line.id === player.lineTier);
    const fallbackRod = getFirstUnlockedItem(rodItems, level);
    const fallbackLine = getFirstUnlockedItem(lineItems, level);

    if (!activeRod || !isUnlocked(activeRod, level)) {
      player.rodTier = fallbackRod.id;
      if (!player.ownedRods.includes(fallbackRod.id)) {
        player.ownedRods.push(fallbackRod.id);
      }
      changed = true;
    }
    if (!activeLine || !isUnlocked(activeLine, level)) {
      player.lineTier = fallbackLine.id;
      if (!player.ownedLines.includes(fallbackLine.id)) {
        player.ownedLines.push(fallbackLine.id);
      }
      changed = true;
    }
    if (player.activeBaitId) {
      const activeBait = baitItems.find((bait) => bait.id === player.activeBaitId);
      if (!activeBait || !isUnlocked(activeBait, level)) {
        const fallbackBait = getFirstUnlockedItem(baitItems, level);
        player.activeBaitId = fallbackBait?.id || null;
        changed = true;
      }
    }
    return changed;
  }

  const TRASH_ICON_PATHS = {
    rusty_can: "./assets/findings/rusty_can.png",
    old_boot: "./assets/findings/old_boot.png",
    broken_barrel: "./assets/findings/broken_barrel.png",
    torn_net: "./assets/findings/torn_net.png",
    broken_reel: "./assets/findings/broken_reel.png",
    bent_hook: "./assets/findings/bent_hook.png",
    floating_plank: "./assets/findings/floating_plank.png",
    sealed_crate: "./assets/findings/sealed_crate.png",
    old_extinguisher: "./assets/findings/old_extinguisher.png",
    rusty_key: "./assets/findings/rusty_key.png"
  };

  const TRASH_DETAILS = {
    rusty_can: {
      titleRu: "Ржавая банка",
      storyRu: "Подо льдом звякнула банка, будто кто-то из старых рыбаков оставил знак. Холодное железо хранит шёпот прошлых зим.",
      iconPath: TRASH_ICON_PATHS.rusty_can
    },
    old_boot: {
      titleRu: "Старый ботинок",
      storyRu: "Промёрзший ботинок помнит долгую дорогу по льду. Говорят, такая находка приносит удачу на следующей лунке.",
      iconPath: TRASH_ICON_PATHS.old_boot
    },
    broken_barrel: {
      titleRu: "Разбитая бочка",
      storyRu: "Осколки бочки пахнут старыми складами на берегу. Лёд шлифовал дерево, будто скрывал тайну.",
      iconPath: TRASH_ICON_PATHS.broken_barrel
    },
    torn_net: {
      titleRu: "Рваная сеть",
      storyRu: "Сеть из нитей, переживших не одну стужу. Она напоминает о тех, кто искал улов до рассвета.",
      iconPath: TRASH_ICON_PATHS.torn_net
    },
    broken_reel: {
      titleRu: "Сломанная катушка",
      storyRu: "Катушка скрипит даже в руках — видно, билась с настоящим гигантом. Теперь это лишь память о том рывке.",
      iconPath: TRASH_ICON_PATHS.broken_reel
    },
    bent_hook: {
      titleRu: "Погнутый крючок",
      storyRu: "Крючок согнулся, словно уступил сильному рывку. Бывает, не рыбака ловит рыбу, а рыба — рыбака.",
      iconPath: TRASH_ICON_PATHS.bent_hook
    },
    floating_plank: {
      titleRu: "Плавающая доска",
      storyRu: "Доска, вылизанная водой и льдом, плыла как маленькая льдина. На ней будто остался след от костра.",
      iconPath: TRASH_ICON_PATHS.floating_plank
    },
    sealed_crate: {
      titleRu: "Запечатанный ящик",
      storyRu: "Ящик плотно запечатан, холод держит его секреты. Может, внутри чья-то зимняя история.",
      iconPath: TRASH_ICON_PATHS.sealed_crate
    },
    old_extinguisher: {
      titleRu: "Старый огнетушитель",
      storyRu: "Старый огнетушитель выглядит нелепо среди льда. Но даже в мороз здесь когда-то кипела жизнь.",
      iconPath: TRASH_ICON_PATHS.old_extinguisher
    },
    rusty_key: {
      titleRu: "Ржавый ключ",
      storyRu: "Ржавый ключ звякнул о край лунки. Говорят, такие находки ведут к забытым дверям на берегу.",
      iconPath: TRASH_ICON_PATHS.rusty_key
    }
  };

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
    const rod = getRodStats();
    const line = getLineStats();
    const gearRareBonus = (rod.rareBonus || 0) + (line.rareBonus || 0);
    const rareMult = gearRareBonus > 0 ? 1 + gearRareBonus : 1;
    const rollTable = fishSpeciesTable.map((fish) => {
      const rodAllowed = fish.minRodTier <= player.rodTier;
      if (!rodAllowed) return { fish, chance: 0 };
      let mult = 1.0;
      if (bait) {
        mult = bait.boost.includes(fish.id) ? 2.0 : 0.8;
      }
      if ((rarityRank[fish.rarity] ?? 0) >= rarityRank.rare) {
        mult *= rareMult;
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
    if (!player.activeBaitId) return "без наживки";
    const bait = baitItems.find((item) => item.id === player.activeBaitId);
    const count = player.baitInventory[player.activeBaitId] || 0;
    return bait ? `${bait.name} (${count})` : "без наживки";
  }

  function sanitizeQuest(data) {
    if (!data || typeof data !== "object" || data.claimed) return null;
    const speciesId = normalizeSpeciesId(data.speciesId);
    const species = fishSpeciesTable.find((entry) => entry.id === speciesId);
    if (!species) return null;
    const limits = FISH_WEIGHT_LIMITS[speciesId] || { min: species.minKg, max: species.maxKg };
    const minWeight = clamp(Number(data.minWeightKg) || limits.min, limits.min, limits.max);
    const maxWeight = clamp(Number(data.maxWeightKg) || limits.max, limits.min, limits.max);
    if (maxWeight < minWeight) return null;
    const difficulty = QUEST_DIFFICULTIES[data.difficulty] ? data.difficulty : "easy";
    return {
      id: data.id || `quest-${Date.now()}`,
      difficulty,
      speciesId,
      speciesName: species.name,
      minWeightKg: minWeight,
      maxWeightKg: maxWeight,
      rewardCoins: Math.max(0, Math.round(Number(data.rewardCoins) || 0)),
      rewardXp: Math.max(0, Math.round(Number(data.rewardXp) || 0)),
      status: data.status === "completed" ? "completed" : "active",
      createdAt: data.createdAt || new Date().toISOString()
    };
  }

  function pickQuestSpecies(difficultyKey) {
    const config = QUEST_DIFFICULTIES[difficultyKey] || QUEST_DIFFICULTIES.easy;
    const available = fishSpeciesTable.filter((species) => species.minRodTier <= player.rodTier);
    const pool = available.filter((species) => config.rarityPool.includes(species.rarity));
    const finalPool = pool.length ? pool : available;
    const total = finalPool.reduce((sum, species) => sum + species.chance, 0);
    let roll = Math.random() * total;
    for (const species of finalPool) {
      roll -= species.chance;
      if (roll <= 0) return species;
    }
    return finalPool[0];
  }

  function roundWeight(value) {
    return Math.round(value * 10) / 10;
  }

  function buildQuestRange(species, difficultyKey) {
    const limits = FISH_WEIGHT_LIMITS[species.id] || { min: species.minKg, max: species.maxKg };
    const range = limits.max - limits.min;
    const config = QUEST_DIFFICULTIES[difficultyKey] || QUEST_DIFFICULTIES.easy;
    const width = clamp(range * config.rangePct, config.minWidth, range);
    const centerMin = limits.min + width / 2;
    const centerMax = limits.max - width / 2;
    const center = centerMin <= centerMax ? rand(centerMin, centerMax) : (limits.min + limits.max) / 2;
    const minWeight = clamp(roundWeight(center - width / 2), limits.min, limits.max);
    const maxWeight = clamp(roundWeight(center + width / 2), limits.min, limits.max);
    return { minWeight, maxWeight };
  }

  function buildQuestReward(species, difficultyKey, minWeightKg, maxWeightKg) {
    const config = QUEST_DIFFICULTIES[difficultyKey] || QUEST_DIFFICULTIES.easy;
    const avgWeight = (minWeightKg + maxWeightKg) / 2;
    const baseCoins = avgWeight * species.pricePerKg;
    const rewardCoins = Math.max(1, Math.round(baseCoins * config.rewardMult));
    const baseXp = 10 + (rarityRank[species.rarity] || 0) * 8 + avgWeight * 4;
    const rewardXp = Math.max(5, Math.round(baseXp * config.xpMult));
    return { rewardCoins, rewardXp };
  }

  function generateQuest(difficultyKey) {
    const difficulty = QUEST_DIFFICULTIES[difficultyKey] ? difficultyKey : "easy";
    const species = pickQuestSpecies(difficulty);
    const { minWeight, maxWeight } = buildQuestRange(species, difficulty);
    const reward = buildQuestReward(species, difficulty, minWeight, maxWeight);
    return {
      id: `quest-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
      difficulty,
      speciesId: species.id,
      speciesName: species.name,
      minWeightKg: minWeight,
      maxWeightKg: maxWeight,
      rewardCoins: reward.rewardCoins,
      rewardXp: reward.rewardXp,
      status: "active",
      createdAt: new Date().toISOString()
    };
  }

  function updateQuestReminder() {
    if (!questReminder) return;
    if (!activeQuest) {
      questReminder.textContent = "";
      questReminder.classList.add("hidden");
      return;
    }
    if (activeQuest.status === "completed") {
      questReminder.textContent = "Задание выполнено — забери награду";
    } else {
      questReminder.textContent = `Задание: ${activeQuest.speciesName} ${formatKg(activeQuest.minWeightKg)}–${formatKg(activeQuest.maxWeightKg)}`;
    }
    questReminder.classList.remove("hidden");
  }

  function ensureQuestPreviews() {
    QUEST_DIFFICULTY_KEYS.forEach((key) => {
      if (!questPreviews[key]) {
        questPreviews[key] = generateQuest(key);
      }
    });
  }

  function updateQuestPreviewUI() {
    const difficultyKey = selectedQuestDifficulty;
    const preview = questPreviews[difficultyKey];
    const availableAt = questCooldowns[`${difficultyKey}AvailableAt`] || 0;
    const now = Date.now();
    const isAvailable = now >= availableAt;
    if (!preview && isAvailable) {
      questPreviews[difficultyKey] = generateQuest(difficultyKey);
    }
    const currentPreview = questPreviews[difficultyKey];
    if (!isAvailable) {
      if (questPreviewSpecies) questPreviewSpecies.textContent = "Недоступно";
      if (questPreviewWeight) questPreviewWeight.textContent = `Доступно через: ${formatDuration(availableAt - now)}`;
      if (questPreviewReward) questPreviewReward.textContent = "—";
      if (btnQuestAccept) btnQuestAccept.disabled = true;
      return;
    }
    if (!currentPreview) {
      if (questPreviewSpecies) questPreviewSpecies.textContent = "—";
      if (questPreviewWeight) questPreviewWeight.textContent = "—";
      if (questPreviewReward) questPreviewReward.textContent = "—";
      if (btnQuestAccept) btnQuestAccept.disabled = true;
      return;
    }
    if (questPreviewSpecies) questPreviewSpecies.textContent = currentPreview.speciesName;
    if (questPreviewWeight) questPreviewWeight.textContent = `${formatKg(currentPreview.minWeightKg)}–${formatKg(currentPreview.maxWeightKg)}`;
    if (questPreviewReward) questPreviewReward.textContent = `${formatCoins(currentPreview.rewardCoins)} + ${currentPreview.rewardXp} XP`;
    if (btnQuestAccept) btnQuestAccept.disabled = false;
  }

  function setQuestPreview(difficultyKey) {
    questPreviews[difficultyKey] = generateQuest(difficultyKey);
    updateQuestPreviewUI();
    updateQuestDifficultyButtons();
  }

  function updateQuestDifficultyButtons() {
    if (!difficultyButtons.length) return;
    difficultyButtons.forEach((btn) => {
      const isActive = btn.dataset.difficulty === selectedQuestDifficulty;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  }

  function renderTrophyQuest() {
    if (!trophyQuestSection || !trophyActiveSection) return;
    if (activeQuest) {
      trophyQuestSection.classList.add("hidden");
      trophyActiveSection.classList.remove("hidden");
      if (activeQuestSpecies) activeQuestSpecies.textContent = activeQuest.speciesName;
      if (activeQuestWeight) activeQuestWeight.textContent = `${formatKg(activeQuest.minWeightKg)}–${formatKg(activeQuest.maxWeightKg)}`;
      if (activeQuestReward) activeQuestReward.textContent = `${formatCoins(activeQuest.rewardCoins)} + ${activeQuest.rewardXp} XP`;
      if (activeQuestStatus) {
        const completed = activeQuest.status === "completed";
        activeQuestStatus.textContent = completed ? "Выполнено" : "В процессе";
        activeQuestStatus.classList.toggle("is-complete", completed);
      }
      if (btnQuestClaim) btnQuestClaim.disabled = activeQuest.status !== "completed";
    } else {
      trophyActiveSection.classList.add("hidden");
      trophyQuestSection.classList.remove("hidden");
      if (!questPreviews[selectedQuestDifficulty]) {
        questPreviews[selectedQuestDifficulty] = generateQuest(selectedQuestDifficulty);
      }
      updateQuestDifficultyButtons();
      updateQuestTimers();
      if (!questRefreshTicker && questRefreshStatus) {
        questRefreshTicker = window.setInterval(updateQuestTimers, 500);
      }
    }
  }

  function getQuestRefreshCooldown(refreshCount) {
    if (refreshCount >= QUEST_REFRESH_COOLDOWNS.length) {
      return QUEST_REFRESH_COOLDOWNS[QUEST_REFRESH_COOLDOWNS.length - 1];
    }
    return QUEST_REFRESH_COOLDOWNS[refreshCount];
  }

  function updateQuestTimers() {
    updateQuestPreviewUI();
    updateQuestRefreshUI();
  }

  function updateQuestRefreshUI() {
    if (!btnQuestRefresh || !questRefreshStatus) return;
    const now = Date.now();
    const remaining = questRefreshState.nextRefreshAt - now;
    if (remaining > 0) {
      btnQuestRefresh.disabled = true;
      questRefreshStatus.textContent = `Можно через: ${formatDuration(remaining)}`;
      return;
    }
    btnQuestRefresh.disabled = false;
    questRefreshStatus.textContent = "";
  }

  function checkQuestCompletion(catchData) {
    if (!activeQuest || activeQuest.status !== "active") return;
    if (catchData.catchType !== "fish") return;
    if (catchData.speciesId !== activeQuest.speciesId) return;
    if (catchData.weightKg < activeQuest.minWeightKg || catchData.weightKg > activeQuest.maxWeightKg) return;
    activeQuest.status = "completed";
    save();
    updateQuestReminder();
    renderTrophyQuest();
    showQuestToast("Цель выполнена", "Загляни в трофейную за наградой");
  }

  function awardQuestRewards(quest) {
    if (!quest) return;
    awardCoins(quest.rewardCoins);
    const gainedXP = Math.max(1, Math.round(quest.rewardXp));
    player.playerXP += gainedXP;
    player.playerXPTotal += gainedXP;
    const levelsGained = progression.normalize();
    updateHUD();
    showXPGain({
      gainedXP,
      leveledUp: levelsGained > 0,
      levelsGained,
      level: player.playerLevel,
      xp: player.playerXP,
      xpToNext: player.playerXPToNext
    });
    updateLeaderboardsFromStats();
    if (levelsGained > 0) {
      renderGearShop();
      refreshProfileGearPicker();
    }
  }

  function buildFishCatch(rareBoostActive = false) {
    const species = rollFish(rareBoostActive);
    const rawWeight = triangular(species.minKg, species.modeKg, species.maxKg);
    const weightKg = Math.round(clamp(rawWeight, species.minKg, species.maxKg) * 100) / 100;
    const weightG = Math.round(weightKg * 1000);
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
      weightG,
      pricePerKg: species.pricePerKg,
      sellValue,
      story: species.story,
      iconPath: species.icon,
      power
    };
  }

  function buildTrashCatch() {
    const item = pickTrashItem(foundTrash);
    const details = TRASH_DETAILS[item.id];
    const name = details?.titleRu || item.name;
    const weightKg = Math.round(rand(0.2, 1.6) * 100) / 100;
    const weightG = Math.round(weightKg * 1000);
    const power = clamp(0.24 + weightKg * 0.06, 0.22, 0.45);
    return {
      catchType: "trash",
      trashId: item.id,
      name,
      rarity: "trash",
      rarityLabel: rarityLabels.trash,
      weightKg,
      weightG,
      pricePerKg: 0,
      sellValue: 0,
      story: details?.storyRu || "",
      iconPath: details?.iconPath || TRASH_ICON_PATHS[item.id],
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
    const baseSweetWidth = clamp(0.30 - power * 0.08 + (lineTier - 1) * 0.02, 0.22, 0.32);
    const sweetWidth = clamp(baseSweetWidth * (1 + (rod.safeZoneBonus || 0)), 0.22, 0.36);
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
    if (isFighting) return;
    muted = !muted;
    updateMuteButton();
    if (!muted) beep(660, 0.06, 0.05);
  });

  // ===== DPI / Resize =====
  let W = 0, H = 0, DPR = 1;
  const HERO_ROD_Y_OFFSET_FACTOR = 0.65;
  const HERO_ROD_SAFE_PADDING = 12;

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

  function updateHeroRodOffset() {
    if (!lakeScene || !heroLayer) return;
    const heroRect = heroLayer.getBoundingClientRect();
    if (!heroRect.height) return;
    const currentOffset = Number.parseFloat(
      getComputedStyle(lakeScene).getPropertyValue("--hero-rod-y-offset")
    ) || 0;
    const baseCenterY = heroRect.top + heroRect.height / 2 - currentOffset;
    const baseTopY = baseCenterY - heroRect.height / 2;
    const desiredOffset = Math.round(heroRect.height * HERO_ROD_Y_OFFSET_FACTOR);
    const bottomHudHeight = bottomBar ? bottomBar.getBoundingClientRect().height : 0;
    const safeBottomY = H - bottomHudHeight - HERO_ROD_SAFE_PADDING;
    const maxOffsetViewport = Math.max(0, Math.floor(H - heroRect.height / 2 - baseCenterY));
    const maxOffsetHud = Math.max(0, Math.floor(safeBottomY - heroRect.height - baseTopY));
    const nextOffset = clamp(desiredOffset, 0, Math.min(maxOffsetViewport, maxOffsetHud));
    lakeScene.style.setProperty("--hero-rod-y-offset", `${nextOffset}px`);
  }
  // Layer interactivity is controlled here to keep game taps on the scene only.
  function updateLayerVisibility() {
    if (orientationLocked) {
      disableGameInput();
    } else {
      enableGameInput();
    }
    updateModalLayerState();
  }

  function applyViewportToLayer(layer, vp) {
    if (!layer) return;
    layer.style.top = `${vp.y}px`;
    layer.style.left = `${vp.x}px`;
    layer.style.width = `${vp.w}px`;
    layer.style.height = `${vp.h}px`;
  }

  function positionRareBoostHud(vp) {
    if (!rareBoostHud) return;
    const topBarHeight = topBar?.getBoundingClientRect().height ?? 0;
    const top = vp.y + topBarHeight + 12;
    rareBoostHud.style.top = `${Math.round(top)}px`;
    rareBoostHud.style.right = `${Math.round(vp.safeRightPx + 14)}px`;
    rareBoostHud.style.left = "auto";
  }

  function positionCityHud(vp) {
    if (!cityHud) return;
    cityHud.style.left = `${Math.round(vp.x + vp.w / 2)}px`;
    cityHud.style.bottom = `${Math.round(vp.safeBottomPx + 16)}px`;
  }

  const layout = () => {
    const vp = getGameViewportRect();
    applyViewportToLayer(modalLayer, vp);
    resize();
    applyLakeRig();
    if (!bobber.visible) {
      syncBobberToRodTip();
    }
    positionRareBoostHud(vp);
    positionCityHud(vp);
    updateLayerVisibility();
  };

  const handleResize = debounce(updateOrientationLock, 100);
  window.addEventListener("resize", handleResize);
  window.addEventListener("orientationchange", updateOrientationLock);
  orientationQuery?.addEventListener?.("change", updateOrientationLock);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", layout, { passive: true });
    window.visualViewport.addEventListener("scroll", layout, { passive: true });
  }

  // ===== Persistent state =====
  const STORAGE_KEY = "icefish_v1";
  const STORAGE_VERSION = 9;
  const NICK_REGISTRY_KEY = "icefish_nick_registry";

  function loadNickRegistry() {
    try {
      const raw = localStorage.getItem(NICK_REGISTRY_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function saveNickRegistry() {
    try {
      localStorage.setItem(NICK_REGISTRY_KEY, JSON.stringify(nickRegistry));
    } catch {}
  }

  function normalizeNicknameKey(value) {
    return (value || "").trim().toLowerCase();
  }

  let nickRegistry = loadNickRegistry();

  const stats = {
    coins: 0,
    bestCoin: 0,
    totalFishCaught: 0,
    totalGoldEarned: 0,
    maxFishWeightG: 0,
    bestRarityTier: 0,
    bestRarityName: "",
    bestRarityLabel: "",
    bestRarityFishWeightG: 0,
    totalPlayTimeMs: 0
  };

  let profile = null;

  const player = {
    coins: 0,
    activeBaitId: null,
    baitInventory: {},
    rodTier: 1,
    lineTier: 1,
    ownedRods: [1],
    ownedLines: [1],
    playerLevel: 1,
    playerXP: 0,
    playerXPTotal: 0,
    playerXPToNext: 60
  };

  let inventory = [];
  let inventorySort = "WEIGHT_DESC";
  let activeQuest = null;
  let questPreviews = { easy: null, medium: null, hard: null };
  let questCooldowns = { easyAvailableAt: 0, mediumAvailableAt: 0, hardAvailableAt: 0 };
  let questRefreshState = { refreshCount: 0, nextRefreshAt: 0 };
  let pendingRename = null;
  let renameReturnToProfile = false;
  let activeProfileGear = null;
  let selectedQuestDifficulty = "easy";
  let questRefreshTicker = null;
  let selectedGearTab = "bait";
  let currentScene = SCENE_LAKE;
  let pendingCatch = null;
  let pendingFinding = null;
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

  const leaderboardBoardIds = ["max_weight", "best_rarity", "gold_earned", "level"];

  class LocalLeaderboardProvider {
    constructor() {
      this.boards = {
        max_weight: [],
        best_rarity: [],
        gold_earned: [],
        level: []
      };
    }

    load(data) {
      if (!data || typeof data !== "object") return;
      leaderboardBoardIds.forEach((id) => {
        if (Array.isArray(data[id])) {
          this.boards[id] = data[id].filter((entry) => entry && typeof entry.name === "string");
        }
      });
    }

    save() {
      return { ...this.boards };
    }

    submit(boardId, entry) {
      if (!boardId || !entry || !entry.name) return;
      const list = Array.isArray(this.boards[boardId]) ? [...this.boards[boardId]] : [];
      const normalized = {
        name: entry.name,
        score: Math.max(0, Math.floor(Number(entry.score) || 0)),
        tieBreak: Number.isFinite(entry.tieBreak) ? Math.floor(entry.tieBreak) : null,
        updatedAt: entry.updatedAt || Date.now()
      };
      const existingIndex = list.findIndex((item) => item.name === normalized.name);
      const shouldReplace = (a, b) => {
        if (!b) return true;
        if (a.score !== b.score) return a.score > b.score;
        const aTie = Number.isFinite(a.tieBreak) ? a.tieBreak : 0;
        const bTie = Number.isFinite(b.tieBreak) ? b.tieBreak : 0;
        if (aTie !== bTie) return aTie > bTie;
        return a.updatedAt > b.updatedAt;
      };
      if (existingIndex >= 0) {
        const current = list[existingIndex];
        if (!shouldReplace(normalized, current)) {
          return;
        }
        list.splice(existingIndex, 1);
      }
      list.push(normalized);
      list.sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        const aTie = Number.isFinite(a.tieBreak) ? a.tieBreak : 0;
        const bTie = Number.isFinite(b.tieBreak) ? b.tieBreak : 0;
        if (aTie !== bTie) return bTie - aTie;
        return b.updatedAt - a.updatedAt;
      });
      this.boards[boardId] = list.slice(0, 10);
    }

    getTop(boardId) {
      return Array.isArray(this.boards[boardId]) ? this.boards[boardId] : [];
    }

    getAllNames() {
      const names = new Set();
      leaderboardBoardIds.forEach((id) => {
        (this.boards[id] || []).forEach((entry) => {
          if (entry?.name) names.add(entry.name);
        });
      });
      return names;
    }

    renamePlayer(oldName, newName) {
      const oldKey = normalizeNicknameKey(oldName);
      const newKey = normalizeNicknameKey(newName);
      if (!oldKey || !newKey) return;
      leaderboardBoardIds.forEach((id) => {
        const list = this.boards[id] || [];
        let changed = false;
        list.forEach((entry) => {
          if (entry?.name && normalizeNicknameKey(entry.name) === oldKey) {
            entry.name = newName;
            changed = true;
          }
        });
        if (changed) this.boards[id] = list;
      });
    }
  }

  const leaderboardProvider = new LocalLeaderboardProvider();

  function normalizeInventoryEntry(entry) {
    if (!entry || entry.catchType === "trash") return entry;
    const normalizedId = normalizeSpeciesId(entry.speciesId);
    if (normalizedId && normalizedId !== entry.speciesId) {
      entry.speciesId = normalizedId;
      const species = fishSpeciesTable.find((item) => item.id === normalizedId);
      if (species) {
        entry.name = species.name;
        entry.rarity = species.rarity;
      }
    }
    if (!entry.iconPath && normalizedId && fishIcons[normalizedId]) {
      entry.iconPath = fishIcons[normalizedId];
    }
    return entry;
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const obj = JSON.parse(raw);
      stats.coins = Number(obj.coins || 0);
      stats.bestCoin = Number(obj.bestCoin || 0);
      stats.totalFishCaught = Number(obj.totalFishCaught ?? obj.fish ?? 0);
      stats.totalGoldEarned = Number(obj.totalGoldEarned ?? 0);
      stats.maxFishWeightG = Number(obj.maxFishWeightG ?? 0);
      stats.bestRarityTier = Number(obj.bestRarityTier ?? 0);
      stats.bestRarityName = obj.bestRarityName || "";
      stats.bestRarityLabel = obj.bestRarityLabel || "";
      stats.bestRarityFishWeightG = Number(obj.bestRarityFishWeightG ?? 0);
      stats.totalPlayTimeMs = Number(obj.totalPlayTimeMs ?? 0);
      muted = !!obj.muted;
      if (obj.profile && typeof obj.profile === "object") {
        const canRename = obj.profile.canRename !== false;
        const renameFreeUsed = obj.profile.renameFreeUsed !== undefined
          ? !!obj.profile.renameFreeUsed
          : (obj.profile.freeRenameUsed !== undefined ? !!obj.profile.freeRenameUsed : !canRename);
        const storedName = obj.profile.nickname || obj.profile.name || "";
        profile = {
          nickname: storedName,
          renameFreeUsed,
          createdAt: obj.profile.createdAt || Date.now()
        };
        if (!profile.nickname) {
          profile = null;
        }
      }
      if (obj.leaderboards) {
        leaderboardProvider.load(obj.leaderboards);
      }
      if (obj.storageVersion >= 2 && Array.isArray(obj.inventory)) {
        inventory = obj.inventory.map((entry) => normalizeInventoryEntry(entry));
      }
      if (obj.storageVersion >= 3) {
        const savedPlayer = obj.player || {};
        player.coins = Number(savedPlayer.coins || stats.coins || 0);
        player.activeBaitId = savedPlayer.activeBaitId || null;
        player.baitInventory = savedPlayer.baitInventory || {};
        if (player.activeBaitId && (player.baitInventory[player.activeBaitId] || 0) <= 0) {
          player.activeBaitId = null;
        }
        player.rodTier = Number(savedPlayer.rodTier || 1);
        player.lineTier = Number(savedPlayer.lineTier || 1);
        if (Array.isArray(savedPlayer.ownedRods) && savedPlayer.ownedRods.length) {
          player.ownedRods = savedPlayer.ownedRods.map((id) => Number(id)).filter((id) => Number.isFinite(id));
        } else {
          player.ownedRods = Array.from({ length: player.rodTier }, (_, idx) => idx + 1);
        }
        if (Array.isArray(savedPlayer.ownedLines) && savedPlayer.ownedLines.length) {
          player.ownedLines = savedPlayer.ownedLines.map((id) => Number(id)).filter((id) => Number.isFinite(id));
        } else {
          player.ownedLines = Array.from({ length: player.lineTier }, (_, idx) => idx + 1);
        }
        progression.load(savedPlayer);
        if (obj.trophyQuest && typeof obj.trophyQuest === "object") {
          activeQuest = sanitizeQuest(obj.trophyQuest);
        }
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
      if (obj.storageVersion >= 7) {
        if (obj.questPreview && typeof obj.questPreview === "object") {
          QUEST_DIFFICULTY_KEYS.forEach((key) => {
            questPreviews[key] = sanitizeQuest(obj.questPreview[key]);
          });
        }
        if (obj.questCooldowns && typeof obj.questCooldowns === "object") {
          questCooldowns = {
            easyAvailableAt: Number(obj.questCooldowns.easyAvailableAt || 0),
            mediumAvailableAt: Number(obj.questCooldowns.mediumAvailableAt || 0),
            hardAvailableAt: Number(obj.questCooldowns.hardAvailableAt || 0)
          };
        }
        if (obj.previewRefresh && typeof obj.previewRefresh === "object") {
          const legacyCount = Math.max(0, Number(obj.previewRefresh.stepIndex || 0));
          questRefreshState = {
            refreshCount: legacyCount,
            nextRefreshAt: Math.max(0, Number(obj.previewRefresh.nextAllowedAt || 0))
          };
        }
        if (obj.questRefreshState && typeof obj.questRefreshState === "object") {
          questRefreshState = {
            refreshCount: Math.max(0, Number(obj.questRefreshState.refreshCount || 0)),
            nextRefreshAt: Math.max(0, Number(obj.questRefreshState.nextRefreshAt || 0))
          };
        }
      }
      stats.coins = player.coins;
      if (profile?.nickname) {
        registerNickname(profile.nickname);
      }
      const unlockAdjusted = enforceGearUnlocks();
      refreshDailyCharges();
      updateMuteButton();
      ensureQuestPreviews();
      if (unlockAdjusted) {
        save();
      }
    } catch {}
  }

  function save() {
    try {
      stats.coins = player.coins;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        storageVersion: STORAGE_VERSION,
        coins: player.coins,
        bestCoin: stats.bestCoin,
        totalFishCaught: stats.totalFishCaught,
        totalGoldEarned: stats.totalGoldEarned,
        maxFishWeightG: stats.maxFishWeightG,
        bestRarityTier: stats.bestRarityTier,
        bestRarityName: stats.bestRarityName,
        bestRarityLabel: stats.bestRarityLabel,
        bestRarityFishWeightG: stats.bestRarityFishWeightG,
        totalPlayTimeMs: stats.totalPlayTimeMs,
        muted,
        inventory,
        foundTrash,
        collectorRodUnlocked,
        dailyRareBoostCharges,
        lastChargeResetDate,
        profile: profile
          ? {
            nickname: profile.nickname,
            renameFreeUsed: profile.renameFreeUsed,
            createdAt: profile.createdAt
          }
          : null,
        leaderboards: leaderboardProvider.save(),
        player: {
          coins: player.coins,
          activeBaitId: player.activeBaitId,
          baitInventory: player.baitInventory,
          rodTier: player.rodTier,
          lineTier: player.lineTier,
          ownedRods: player.ownedRods,
          ownedLines: player.ownedLines,
          ...progression.save()
        },
        trophyQuest: activeQuest,
        questPreview: questPreviews,
        questCooldowns,
        questRefreshState
      }));
    } catch {}
  }

  function resetProgress() {
    stats.coins = 0;
    player.coins = 0;
    stats.bestCoin = 0;
    stats.totalFishCaught = 0;
    stats.totalGoldEarned = 0;
    stats.maxFishWeightG = 0;
    stats.bestRarityTier = 0;
    stats.bestRarityName = "";
    stats.bestRarityLabel = "";
    stats.bestRarityFishWeightG = 0;
    stats.totalPlayTimeMs = 0;
    inventory = [];
    player.activeBaitId = null;
    player.baitInventory = {};
    player.rodTier = 1;
    player.lineTier = 1;
    player.ownedRods = [1];
    player.ownedLines = [1];
    player.playerLevel = 1;
    player.playerXP = 0;
    player.playerXPTotal = 0;
    player.playerXPToNext = progression.xpRequired(1);
    foundTrash = {};
    collectorRodUnlocked = false;
    dailyRareBoostCharges = 0;
    lastChargeResetDate = null;
    activeQuest = null;
    questPreviews = { easy: null, medium: null, hard: null };
    questCooldowns = { easyAvailableAt: 0, mediumAvailableAt: 0, hardAvailableAt: 0 };
    questRefreshState = { refreshCount: 0, nextRefreshAt: 0 };
    save();
    updateHUD();
    renderInventory();
    renderTrashJournal();
  }

  let playSessionStart = null;

  function startPlaySession() {
    if (document.hidden) return;
    if (playSessionStart !== null) return;
    playSessionStart = Date.now();
  }

  function endPlaySession() {
    if (playSessionStart === null) return;
    const elapsed = Date.now() - playSessionStart;
    stats.totalPlayTimeMs += Math.max(0, elapsed);
    playSessionStart = null;
    updateProfileStatsUI();
    save();
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      endPlaySession();
    } else {
      startPlaySession();
    }
  });

  window.addEventListener("beforeunload", () => {
    endPlaySession();
  });

  btnReset?.addEventListener("click", () => {
    resetProgress();
    setOverlayText("Прогресс сброшен. Нажми «Играть».");
  });

  function updateHUD() {
    if (coinsEl) coinsEl.textContent = String(player.coins);
    if (profileLevelBadge) profileLevelBadge.textContent = String(player.playerLevel);
    updateRareBoostHud();
    updateTrashRewardStatus();
    updateQuestReminder();
    updateProfileStatsUI();
  }

  const xpRingState = {
    currentProgress: 0,
    rafId: null,
    lastXp: null,
    lastLevel: null
  };

  function initXpRing() {
    if (!profileXpRing || profileXpRing.dataset.ready) return;
    profileXpRing.innerHTML = `
      <svg class="xpRingSvg" viewBox="0 0 120 120" aria-hidden="true">
        <circle class="xpRingTrack" cx="60" cy="60" r="52"></circle>
        <circle class="xpRingProgress" cx="60" cy="60" r="52"></circle>
      </svg>
      <div class="xpRingCenter">
        <div class="xpRingLevel"></div>
        <div class="xpRingValue"></div>
      </div>
    `;
    const progressCircle = profileXpRing.querySelector(".xpRingProgress");
    if (progressCircle) {
      const radius = Number(progressCircle.getAttribute("r")) || 52;
      const circumference = 2 * Math.PI * radius;
      progressCircle.style.strokeDasharray = `${circumference}`;
      progressCircle.style.strokeDashoffset = `${circumference}`;
      progressCircle.dataset.circumference = String(circumference);
    }
    profileXpRing.dataset.ready = "true";
  }

  function updateXpRingProgress(progress) {
    if (!profileXpRing) return;
    const progressCircle = profileXpRing.querySelector(".xpRingProgress");
    if (!progressCircle) return;
    const circumference = Number(progressCircle.dataset.circumference) || 0;
    const offset = circumference * (1 - clamp(progress, 0, 1));
    progressCircle.style.strokeDashoffset = `${offset}`;
  }

  function animateXpRing(targetProgress) {
    if (!profileXpRing) return;
    if (xpRingState.rafId) {
      cancelAnimationFrame(xpRingState.rafId);
    }
    const startProgress = xpRingState.currentProgress;
    const duration = 600;
    const startTime = performance.now();
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = easeOut(t);
      const current = startProgress + (targetProgress - startProgress) * eased;
      updateXpRingProgress(current);
      if (t < 1) {
        xpRingState.rafId = requestAnimationFrame(step);
      } else {
        xpRingState.currentProgress = targetProgress;
        xpRingState.rafId = null;
      }
    };
    xpRingState.rafId = requestAnimationFrame(step);
  }

  function triggerRingClass(className, duration = 450) {
    if (!profileXpRing) return;
    profileXpRing.classList.remove(className);
    requestAnimationFrame(() => {
      profileXpRing.classList.add(className);
      window.setTimeout(() => {
        profileXpRing.classList.remove(className);
      }, duration);
    });
  }

  function renderXpRing(level, xp, nextXp) {
    if (!profileXpRing) return;
    initXpRing();
    const levelEl = profileXpRing.querySelector(".xpRingLevel");
    const valueEl = profileXpRing.querySelector(".xpRingValue");
    if (levelEl) levelEl.textContent = String(level ?? 1);
    if (valueEl) valueEl.textContent = `${xp}/${nextXp}`;

    const targetProgress = nextXp > 0 ? clamp(xp / nextXp, 0, 1) : 0;
    const unchanged = xpRingState.lastXp === xp && xpRingState.lastLevel === level;
    if (xpRingState.lastXp === null) {
      xpRingState.currentProgress = targetProgress;
      updateXpRingProgress(targetProgress);
    } else if (!unchanged || xpRingState.currentProgress !== targetProgress) {
      animateXpRing(targetProgress);
    }

    const levelUp = xpRingState.lastLevel !== null && level > xpRingState.lastLevel;
    const xpIncrease = xpRingState.lastXp !== null && xp > xpRingState.lastXp;
    if (levelUp) {
      triggerRingClass("xpRing--levelup", 520);
    } else if (xpIncrease) {
      triggerRingClass("xpRing--pulse", 420);
    }

    xpRingState.lastXp = xp;
    xpRingState.lastLevel = level;
  }

  function getRarityLabelByTier(tier) {
    const entry = Object.entries(rarityRank).find(([, value]) => value === tier && value >= 0);
    if (!entry) return "обычная";
    return rarityLabels[entry[0]] || entry[0];
  }

  function updateProfileStatsUI() {
    if (profileName) profileName.textContent = profile?.nickname || "—";
    if (btnProfileRename) {
      btnProfileRename.disabled = !profile;
    }
    renderXpRing(player.playerLevel, player.playerXP, player.playerXPToNext);
    if (statPlayTime) {
      const live = playSessionStart ? Date.now() - playSessionStart : 0;
      statPlayTime.textContent = formatDuration(stats.totalPlayTimeMs + live);
    }
    if (statFishCaught) statFishCaught.textContent = String(stats.totalFishCaught);
    if (statGoldEarned) statGoldEarned.textContent = formatCoins(stats.totalGoldEarned);
    if (statMaxWeight) statMaxWeight.textContent = formatWeightFromGrams(stats.maxFishWeightG);
    if (statBestRarity) {
      if (stats.bestRarityName) {
        statBestRarity.textContent = stats.bestRarityName;
      } else {
        statBestRarity.textContent = "—";
      }
    }
    if (profileRodName) profileRodName.textContent = getRodStats().name;
    if (profileLineName) profileLineName.textContent = getLineStats().name;
    if (profileBaitName) profileBaitName.textContent = getActiveBaitLabel();
  }

  function awardCoins(amount) {
    const gained = Math.max(0, Math.round(Number(amount) || 0));
    if (!gained) return;
    player.coins += gained;
    stats.totalGoldEarned += gained;
    updateLeaderboardsFromStats();
    updateProfileStatsUI();
  }

  function updateCatchStats(catchData) {
    if (!catchData || catchData.catchType !== "fish") return;
    const weightG = Number.isFinite(catchData.weightG)
      ? catchData.weightG
      : Math.round((catchData.weightKg || 0) * 1000);
    stats.totalFishCaught += 1;
    stats.maxFishWeightG = Math.max(stats.maxFishWeightG, weightG);
    const tier = rarityRank[catchData.rarity] ?? 0;
    if (tier > stats.bestRarityTier || (tier === stats.bestRarityTier && weightG > stats.bestRarityFishWeightG)) {
      stats.bestRarityTier = tier;
      stats.bestRarityName = catchData.name;
      stats.bestRarityLabel = catchData.rarityLabel || rarityLabels[catchData.rarity] || catchData.rarity;
      stats.bestRarityFishWeightG = weightG;
    }
    updateLeaderboardsFromStats();
  }

  function updateLeaderboardsFromStats() {
    if (!profile?.nickname) return;
    const now = Date.now();
    leaderboardProvider.submit("max_weight", { name: profile.nickname, score: stats.maxFishWeightG, updatedAt: now });
    leaderboardProvider.submit("best_rarity", {
      name: profile.nickname,
      score: stats.bestRarityTier,
      tieBreak: stats.bestRarityFishWeightG,
      updatedAt: now
    });
    leaderboardProvider.submit("gold_earned", { name: profile.nickname, score: stats.totalGoldEarned, updatedAt: now });
    leaderboardProvider.submit("level", { name: profile.nickname, score: player.playerLevel, tieBreak: player.playerXPTotal, updatedAt: now });
  }

  function normalizeNickname(value) {
    return normalizeNicknameKey(value);
  }

  function isNicknameValid(name) {
    return /^[A-Za-z0-9_]{3,12}$/.test(name);
  }

  function isNicknameTaken(name, options = {}) {
    const { allowCurrent = true } = options;
    const key = normalizeNicknameKey(name);
    if (!key) return false;
    if (allowCurrent && profile?.nickname && normalizeNicknameKey(profile.nickname) === key) return false;
    if (nickRegistry[key]) return true;
    const taken = leaderboardProvider.getAllNames();
    for (const entry of taken) {
      if (normalizeNicknameKey(entry) === key) return true;
    }
    return false;
  }

  function registerNickname(name) {
    const key = normalizeNicknameKey(name);
    if (!key) return;
    nickRegistry[key] = true;
    saveNickRegistry();
  }

  function getRenameCost() {
    if (!profile) return 0;
    return profile.renameFreeUsed ? 10000 : 0;
  }

  function canRenameProfile() {
    return !!profile;
  }

  function getNextAvailableUserName(startIndex = 1) {
    let idx = Math.max(1, startIndex);
    while (isNicknameTaken(`user${idx}`, { allowCurrent: false })) idx += 1;
    return { name: `user${idx}`, nextIndex: idx + 1 };
  }

  function setProfileError(target, message) {
    if (!target) return;
    target.textContent = message || "";
    target.classList.toggle("is-error", !!message);
  }

  let suggestedUserIndex = 1;

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
    if (trashFoundTotal) trashFoundTotal.textContent = `/${trashItems.length}.`;
    const foundCount = getFoundTrashCount();
    const progressPct = trashItems.length > 0 ? clamp(foundCount / trashItems.length, 0, 1) * 100 : 0;
    if (trashProgressFill) trashProgressFill.style.width = `${progressPct}%`;
    if (collectorRodUnlocked) {
      trashRewardStatus.classList.add("is-complete");
      if (trashRewardLineProgress) trashRewardLineProgress.setAttribute("aria-hidden", "true");
      if (trashRewardLineComplete) trashRewardLineComplete.removeAttribute("aria-hidden");
      return;
    }
    trashRewardStatus.classList.remove("is-complete");
    if (trashRewardLineProgress) trashRewardLineProgress.removeAttribute("aria-hidden");
    if (trashRewardLineComplete) trashRewardLineComplete.setAttribute("aria-hidden", "true");
    if (trashFoundCount) trashFoundCount.textContent = String(foundCount);
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
      const iconPath = TRASH_DETAILS[item.id]?.iconPath || TRASH_ICON_PATHS[item.id];
      const showIcon = found && !!iconPath;
      const cell = document.createElement("div");
      cell.className = `trashCell findingTile ${found ? "is-found" : "is-missing"}`;
      cell.dataset.trashId = item.id;
      if (!found && item.id === "rusty_key") cell.classList.add("is-special");
      if (!found) {
        const silhouette = document.createElement("div");
        silhouette.className = `trashSilhouette trashSilhouette--${item.id}`;
        cell.append(silhouette);
      }
      const inner = document.createElement("div");
      inner.className = "findingTileInner";
      if (showIcon) {
        const icon = document.createElement("img");
        icon.className = "findingIcon";
        icon.src = iconPath;
        icon.alt = item.name;
        icon.loading = "lazy";
        icon.decoding = "async";
        icon.addEventListener("error", () => {
          icon.remove();
        });
        inner.append(icon);
      }
      const label = document.createElement("div");
      label.className = "findingLabel";
      label.textContent = found ? item.name : "???";
      inner.append(label);
      cell.append(inner);
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
    const bonus = alreadyFound ? (DEV_TRASH_TEST ? 25 : 6) : 0;
    if (!alreadyFound) {
      foundTrash[catchData.trashId] = true;
    } else {
      awardCoins(bonus);
    }
    if (getFoundTrashCount() >= trashItems.length) {
      unlockCollectorRod();
    }
    updateHUD();
    renderTrashJournal();
    save();
    return {
      alreadyFound,
      bonus
    };
  }

  function openInventory() {
    if (isFighting) return;
    invOverlay?.classList.remove("hidden");
    if (invSort) invSort.value = inventorySort;
    renderInventory();
    updateModalLayerState();
  }

  function closeInventory() {
    invOverlay?.classList.add("hidden");
    updateModalLayerState();
  }

  function openTrashJournal() {
    if (isFighting) return;
    if (!trashOverlay) return;
    trashOverlay.classList.remove("hidden");
    requestAnimationFrame(() => {
      trashOverlay.classList.add("is-visible");
    });
    renderTrashJournal();
    updateModalLayerState();
  }

  function closeTrashJournal() {
    if (!trashOverlay) return;
    trashOverlay.classList.remove("is-visible");
    window.setTimeout(() => {
      trashOverlay.classList.add("hidden");
      updateModalLayerState();
    }, 250);
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

  function showProfileScreen(screen) {
    const screens = {
      main: profileScreenMain,
      stats: profileScreenStats,
      gear: profileScreenGear
    };
    Object.entries(screens).forEach(([key, el]) => {
      if (!el) return;
      el.classList.toggle("hidden", key !== screen);
    });
  }

  function openProfile() {
    if (isFighting) return;
    if (!profileOverlay) return;
    profileOverlay.classList.remove("hidden");
    profileOverlay.setAttribute("aria-hidden", "false");
    showProfileScreen("main");
    updateProfileStatsUI();
    updateModalLayerState();
  }

  function closeProfile() {
    profileOverlay?.classList.add("hidden");
    profileOverlay?.setAttribute("aria-hidden", "true");
    pendingRename = null;
    activeProfileGear = null;
    blurActiveInput();
    updateModalLayerState();
  }

  function openProfileSetup() {
    if (isFighting) return;
    if (!profileSetupOverlay) return;
    profileSetupOverlay.classList.remove("hidden");
    profileSetupOverlay.setAttribute("aria-hidden", "false");
    const next = getNextAvailableUserName(suggestedUserIndex);
    if (profileSetupSuggested) profileSetupSuggested.textContent = next.name;
    suggestedUserIndex = next.nextIndex;
    if (profileSetupCustomPanel) profileSetupCustomPanel.classList.add("hidden");
    if (profileSetupInput) profileSetupInput.value = "";
    setProfileError(profileSetupError, "");
    updateModalLayerState();
  }

  function closeProfileSetup() {
    profileSetupOverlay?.classList.add("hidden");
    profileSetupOverlay?.setAttribute("aria-hidden", "true");
    blurActiveInput();
    updateModalLayerState();
  }

  let activeLeaderboardTab = "max_weight";
  let activeTrophyView = "hub";

  function formatLeaderboardScore(boardId, entry) {
    if (!entry) return "—";
    switch (boardId) {
      case "max_weight":
        return formatWeightFromGrams(entry.score);
      case "best_rarity": {
        const label = getRarityLabelByTier(entry.score);
        const tie = Number.isFinite(entry.tieBreak) ? formatWeightFromGrams(entry.tieBreak) : "";
        return tie ? `${label} • ${tie}` : label;
      }
      case "gold_earned":
        return formatCoins(entry.score);
      case "level":
        return `Ур. ${entry.score}`;
      default:
        return String(entry.score ?? 0);
    }
  }

  function renderLeaderboard() {
    if (!leaderboardLocalList || !leaderboardYourRecord) return;
    leaderboardLocalList.innerHTML = "";
    const top = leaderboardProvider.getTop(activeLeaderboardTab);
    if (top.length === 0) {
      const empty = document.createElement("div");
      empty.className = "leaderboardRow";
      empty.textContent = "Локальных записей пока нет.";
      leaderboardLocalList.appendChild(empty);
    } else {
      top.forEach((entry, index) => {
        const row = document.createElement("div");
        row.className = "leaderboardRow";
        row.innerHTML = `
          <span class="leaderboardRank">#${index + 1}</span>
          <span class="leaderboardName">${entry.name}</span>
          <span class="leaderboardScore">${formatLeaderboardScore(activeLeaderboardTab, entry)}</span>
        `;
        leaderboardLocalList.appendChild(row);
      });
    }
    let yourText = "Твой рекорд: —";
    if (profile?.nickname) {
      switch (activeLeaderboardTab) {
        case "max_weight":
          yourText = `Твой рекорд: ${profile.nickname} — ${formatWeightFromGrams(stats.maxFishWeightG)}`;
          break;
        case "best_rarity": {
          const label = stats.bestRarityLabel || getRarityLabelByTier(stats.bestRarityTier);
          const name = stats.bestRarityName ? `${stats.bestRarityName} (${label})` : "—";
          yourText = `Твой рекорд: ${profile.nickname} — ${name}`;
          break;
        }
        case "gold_earned":
          yourText = `Твой рекорд: ${profile.nickname} — ${formatCoins(stats.totalGoldEarned)}`;
          break;
        case "level":
          yourText = `Твой рекорд: ${profile.nickname} — ур. ${player.playerLevel}`;
          break;
        default:
          break;
      }
    }
    leaderboardYourRecord.textContent = yourText;
  }

  function setTrophyView(view) {
    activeTrophyView = view;
    if (trophyHub) trophyHub.classList.toggle("hidden", view !== "hub");
    if (trophyQuestPanel) trophyQuestPanel.classList.toggle("hidden", view !== "quests");
    if (view === "quests") {
      renderTrophyQuest();
    }
  }

  function openLeaderboard() {
    if (isFighting) return;
    if (!leaderboardOverlay) return;
    leaderboardOverlay.classList.remove("hidden");
    leaderboardOverlay.setAttribute("aria-hidden", "false");
    updateLeaderboardsFromStats();
    renderLeaderboard();
    updateModalLayerState();
  }

  function closeLeaderboard() {
    leaderboardOverlay?.classList.add("hidden");
    leaderboardOverlay?.setAttribute("aria-hidden", "true");
    updateModalLayerState();
  }

  btnStar?.addEventListener("click", () => {
    if (isFighting) return;
    if (currentScene !== SCENE_LAKE) return;
    showToast("Скоро.");
  });

  btnProfile?.addEventListener("click", () => {
    if (isFighting) return;
    if (profileSetupOverlay && !profile && !profileSetupOverlay.classList.contains("hidden")) return;
    openProfile();
  });

  btnProfileClose?.addEventListener("click", () => {
    closeProfile();
  });

  btnProfileStatsOpen?.addEventListener("click", () => {
    if (isFighting) return;
    showProfileScreen("stats");
    updateProfileStatsUI();
  });

  btnProfileLeaderboardsOpen?.addEventListener("click", () => {
    if (isFighting) return;
    closeProfile();
    openLeaderboard();
  });

  btnProfileStatsBack?.addEventListener("click", () => {
    showProfileScreen("main");
  });

  btnProfileStatsClose?.addEventListener("click", () => {
    closeProfile();
  });

  btnProfileGearBack?.addEventListener("click", () => {
    showProfileScreen("main");
  });

  btnProfileGearClose?.addEventListener("click", () => {
    closeProfile();
  });

  btnLeaderboardClose?.addEventListener("click", () => {
    closeLeaderboard();
  });

  profileGearToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const gear = toggle.dataset.gear;
      if (!gear) return;
      activeProfileGear = gear;
      if (profileGearTitle) {
        const labelMap = { rod: "Удочка", line: "Леска", bait: "Наживка" };
        profileGearTitle.textContent = `Выбор: ${labelMap[gear] || "Снаряжение"}`;
      }
      renderProfileGearPicker(gear);
      showProfileScreen("gear");
    });
  });

  btnProfileRename?.addEventListener("click", () => {
    if (!canRenameProfile()) return;
    openRenameModal({ returnToProfile: true });
  });

  btnRenameClose?.addEventListener("click", () => {
    closeRenameModal();
  });

  btnRenameSave?.addEventListener("click", () => {
    if (!profile || !renameInput) return;
    if (!canRenameProfile()) return;
    const proposed = normalizeNickname(renameInput.value);
    if (!isNicknameValid(proposed)) {
      setProfileError(renameError, "Ник: 3–12 символов, латиница/цифры/_.");
      return;
    }
    if (normalizeNicknameKey(proposed) === normalizeNicknameKey(profile.nickname)) {
      setProfileError(renameError, "Это текущий ник.");
      return;
    }
    if (isNicknameTaken(proposed)) {
      const suggestion = getNextAvailableUserName(1).name;
      setProfileError(renameError, `Ник занят. Попробуй ${suggestion}.`);
      return;
    }
    pendingRename = { name: proposed, cost: getRenameCost(), previous: profile.nickname };
    if (renameConfirmText) {
      let confirmText = `Вы точно хотите сменить имя на ${pendingRename.name}?`;
      if (pendingRename.cost > 0) {
        confirmText += ` Стоимость: ${formatCoins(pendingRename.cost)}.`;
      }
      renameConfirmText.textContent = confirmText;
    }
    showRenameScreen("confirm");
  });

  btnRenameConfirmBack?.addEventListener("click", () => {
    pendingRename = null;
    showRenameScreen("main");
  });

  btnRenameConfirmSave?.addEventListener("click", () => {
    if (!profile || !pendingRename) return;
    const cost = pendingRename.cost || 0;
    if (cost > 0 && player.coins < cost) {
      setProfileError(renameError, "Недостаточно золота для смены ника.");
      showRenameScreen("main");
      return;
    }
    if (cost > 0) {
      player.coins -= cost;
    }
    if (pendingRename.previous) {
      leaderboardProvider.renamePlayer(pendingRename.previous, pendingRename.name);
    }
    profile.nickname = pendingRename.name;
    profile.renameFreeUsed = true;
    registerNickname(pendingRename.name);
    pendingRename = null;
    setProfileError(renameError, "");
    updateProfileStatsUI();
    updateLeaderboardsFromStats();
    updateHUD();
    save();
    closeRenameModal();
  });

  function applyProfileNickname(name) {
    profile = {
      nickname: name,
      renameFreeUsed: false,
      createdAt: Date.now()
    };
    registerNickname(name);
    setProfileError(profileSetupError, "");
    closeProfileSetup();
    updateProfileStatsUI();
    updateLeaderboardsFromStats();
    save();
  }

  btnProfileSetupAccept?.addEventListener("click", () => {
    const proposed = normalizeNickname(profileSetupSuggested?.textContent || "");
    if (!isNicknameValid(proposed)) {
      setProfileError(profileSetupError, "Ник: 3–12 символов, латиница/цифры/_.");
      return;
    }
    if (isNicknameTaken(proposed, { allowCurrent: false })) {
      const suggestion = getNextAvailableUserName(1).name;
      setProfileError(profileSetupError, `Ник занят. Попробуй ${suggestion}.`);
      return;
    }
    applyProfileNickname(proposed);
  });

  btnProfileSetupCustom?.addEventListener("click", () => {
    if (profileSetupCustomPanel) {
      profileSetupCustomPanel.classList.remove("hidden");
    }
    if (profileSetupInput) {
      profileSetupInput.value = "";
      profileSetupInput.focus();
    }
    setProfileError(profileSetupError, "");
  });

  btnProfileSetupSave?.addEventListener("click", () => {
    if (!profileSetupInput) return;
    const proposed = normalizeNickname(profileSetupInput.value);
    if (!isNicknameValid(proposed)) {
      setProfileError(profileSetupError, "Ник: 3–12 символов, латиница/цифры/_.");
      return;
    }
    if (isNicknameTaken(proposed, { allowCurrent: false })) {
      const suggestion = getNextAvailableUserName(1).name;
      setProfileError(profileSetupError, `Ник занят. Попробуй ${suggestion}.`);
      return;
    }
    applyProfileNickname(proposed);
  });

  leaderboardTabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.leaderboardTab;
      if (!tab) return;
      activeLeaderboardTab = tab;
      leaderboardTabButtons.forEach((button) => {
        const isActive = button.dataset.leaderboardTab === tab;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-selected", isActive ? "true" : "false");
      });
      renderLeaderboard();
    });
  });

  btnTrophyQuests?.addEventListener("click", () => {
    if (isFighting) return;
    setTrophyView("quests");
  });

  btnTrophyRecords?.addEventListener("click", () => {
    if (isFighting) return;
    openLeaderboard();
  });

  btnTrophyBack?.addEventListener("click", () => {
    if (isFighting) return;
    setTrophyView("hub");
  });

  invSort?.addEventListener("change", () => {
    inventorySort = invSort.value;
    renderInventory();
  });

  btnCity?.addEventListener("click", () => {
    if (isFighting) return;
    if (currentScene !== SCENE_LAKE) return;
    startTravel("lake", "city");
  });

  btnBackToLake?.addEventListener("click", () => {
    if (isFighting) return;
    if (currentScene !== SCENE_CITY) return;
    startTravel("city", "lake");
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
    awardCoins(discounted);
    stats.bestCoin = Math.max(stats.bestCoin, discounted);
    updateHUD();
    save();
    pendingCatch = null;
    transitionTo(SCENE_LAKE);
    showToast("Продано со скидкой -30%.");
    setHint("Тап: заброс", 1.2);
  });

  btnFindingContinue?.addEventListener("click", () => {
    if (!pendingFinding) return;
    pendingFinding = null;
    transitionTo(SCENE_LAKE);
    setHint("Тап: заброс", 1.2);
  });

  btnFindingJournal?.addEventListener("click", () => {
    if (!pendingFinding) return;
    pendingFinding = null;
    transitionTo(SCENE_LAKE);
    openTrashJournal();
  });

  btnSellAll?.addEventListener("click", () => {
    const items = inventory.slice();
    if (items.length === 0) {
      showToast("Нет рыбы для продажи.");
      return;
    }
    const total = items.reduce((sum, item) => sum + item.sellValue, 0);
    inventory = [];
    awardCoins(total);
    stats.bestCoin = Math.max(stats.bestCoin, total);
    updateHUD();
    save();
    renderFishShopInventory();
    renderInventory();
    showToast(`Продано: +${total} монет`);
  });

  gearTabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.gearTab;
      if (!tab) return;
      selectedGearTab = tab;
      updateGearTabs();
    });
  });

  difficultyButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const difficulty = btn.dataset.difficulty || "easy";
      if (!QUEST_DIFFICULTIES[difficulty]) return;
      selectedQuestDifficulty = difficulty;
      updateQuestDifficultyButtons();
      updateQuestPreviewUI();
    });
  });

  btnQuestRefresh?.addEventListener("click", () => {
    const now = Date.now();
    if (now < questRefreshState.nextRefreshAt) {
      updateQuestRefreshUI();
      return;
    }
    QUEST_DIFFICULTY_KEYS.forEach((difficulty) => {
      const availableAt = questCooldowns[`${difficulty}AvailableAt`] || 0;
      if (now >= availableAt) {
        questPreviews[difficulty] = generateQuest(difficulty);
      }
    });
    const duration = getQuestRefreshCooldown(questRefreshState.refreshCount);
    questRefreshState.nextRefreshAt = now + duration;
    questRefreshState.refreshCount += 1;
    save();
    updateQuestPreviewUI();
    updateQuestRefreshUI();
  });

  btnQuestAccept?.addEventListener("click", () => {
    const preview = questPreviews[selectedQuestDifficulty];
    if (!preview) return;
    const availableAt = questCooldowns[`${selectedQuestDifficulty}AvailableAt`] || 0;
    if (Date.now() < availableAt) return;
    activeQuest = {
      ...preview,
      status: "active"
    };
    questPreviews[selectedQuestDifficulty] = generateQuest(selectedQuestDifficulty);
    save();
    updateQuestReminder();
    renderTrophyQuest();
  });

  btnQuestClaim?.addEventListener("click", () => {
    if (!activeQuest || activeQuest.status !== "completed") return;
    awardQuestRewards(activeQuest);
    if (activeQuest.difficulty && QUEST_COMPLETION_COOLDOWNS[activeQuest.difficulty]) {
      const lockMs = QUEST_COMPLETION_COOLDOWNS[activeQuest.difficulty];
      questCooldowns[`${activeQuest.difficulty}AvailableAt`] = Date.now() + lockMs;
    }
    activeQuest = null;
    save();
    renderTrophyQuest();
    updateQuestReminder();
    showToast("Награда получена.");
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
    setMsg(`Трофей оформлен: ${item.name} (${formatItemWeight(item)}).`, 1.5);
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
      weight.textContent = formatItemWeight(item);

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
      const species = fishSpeciesTable.find((entry) => entry.id === item.speciesId);
      const chanceText = formatChancePercent(species?.chance);
      const iconPath = item.iconPath || species?.icon;
      detail.innerHTML = `
        ${iconPath ? `
          <div class="invDetailMedia">
            <div class="invDetailThumb" data-icon="${iconPath}">
              <div class="invDetailLoader" aria-hidden="true"></div>
            </div>
            <div class="invDetailMediaInfo">
              <div class="invDetailRow"><strong>Шанс поимки:</strong> ${chanceText}</div>
            </div>
          </div>
        ` : `
          <div class="invDetailRow"><strong>Шанс поимки:</strong> ${chanceText}</div>
        `}
        <div class="invDetailRow"><strong>История:</strong> ${item.story}</div>
        <div class="invDetailRow"><strong>Дата:</strong> ${formatDate(item.caughtAt)}</div>
        <div class="invDetailRow"><strong>Цена за кг:</strong> ${formatCoins(item.pricePerKg)}</div>
        <div class="invDetailRow"><strong>Вес:</strong> ${formatItemWeight(item)}</div>
        <div class="invDetailRow"><strong>Итог продажи:</strong> ${formatCoins(item.sellValue)}</div>
      `;

      const ensureDetailImage = () => {
        if (!iconPath || detail.dataset.imageLoaded === "true") return;
        const thumb = detail.querySelector(".invDetailThumb");
        if (!thumb) return;
        const loader = thumb.querySelector(".invDetailLoader");
        const image = document.createElement("img");
        image.className = "invDetailImage";
        image.alt = item.name;
        image.addEventListener("load", () => {
          thumb.classList.add("is-loaded");
          image.classList.add("is-loaded");
          loader?.classList.add("is-hidden");
        }, { once: true });
        image.addEventListener("error", () => {
          loader?.classList.add("is-hidden");
        }, { once: true });
        image.src = iconPath;
        thumb.appendChild(image);
        detail.dataset.imageLoaded = "true";
      };

      const btnDetails = document.createElement("button");
      btnDetails.className = "invBtn secondary btn--singleLine";
      setButtonText(btnDetails, "Подробнее");
      btnDetails.addEventListener("click", (event) => {
        event.stopPropagation();
        const isHidden = detail.classList.toggle("hidden");
        if (!isHidden) {
          ensureDetailImage();
        }
        setButtonText(btnDetails, isHidden ? "Подробнее" : "Скрыть");
      });

      if (item.canBeTrophy && !item.isTrophy) {
        const btnTrophy = document.createElement("button");
        btnTrophy.className = "invBtn btn--twoLines";
        setButtonText(btnTrophy, "Сделать трофеем");
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
        btnTrophyDetail.className = "invBtn btn--twoLines";
        setButtonText(btnTrophyDetail, "Сделать трофеем");
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
        if (!isHidden) {
          ensureDetailImage();
        }
        setButtonText(btnDetails, isHidden ? "Подробнее" : "Скрыть");
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
      weightG: Number.isFinite(catchData.weightG) ? catchData.weightG : Math.round((catchData.weightKg || 0) * 1000),
      pricePerKg: catchData.pricePerKg,
      sellValue: catchData.sellValue,
      story: catchData.story,
      iconPath: catchData.iconPath,
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
    if (isFighting) return;
    transitionTo(sceneId);
    renderShop(sceneId);
  }

  function renderShop(sceneId = currentScene) {
    if (!shopOverlay) return;
    fishShopSection?.classList.add("hidden");
    trophySection?.classList.add("hidden");
    gearShopSection?.classList.add("hidden");
    if (shopStats) shopStats.classList.add("hidden");
    if (sceneId === SCENE_BUILDING_FISHSHOP) {
      if (shopTitle) shopTitle.textContent = "Рыбная лавка";
      if (fishShopSection) fishShopSection.classList.remove("hidden");
      renderFishShopInventory();
    } else if (sceneId === SCENE_BUILDING_TROPHY) {
      if (shopTitle) shopTitle.textContent = "Трофейная";
      if (trophySection) trophySection.classList.remove("hidden");
      renderTrophyQuest();
      setTrophyView("hub");
    } else if (sceneId === SCENE_BUILDING_GEARSHOP) {
      if (shopTitle) shopTitle.textContent = "Всё для рыбалки";
      if (shopStats) shopStats.classList.remove("hidden");
      renderGearShop();
    }
  }

  function renderShopStats() {
    if (!shopStats) return;
    shopStats.innerHTML = `
      <span>Наживка: ${getActiveBaitLabel()}</span>
      <span>Удочка: ${getRodStats().name}</span>
      <span>Леска: ${getLineStats().name}</span>
    `;
  }

  function createUnlockNote(level) {
    const note = document.createElement("div");
    note.className = "shopItemMeta shopItemLock";
    note.textContent = `Откроется на уровне ${level}`;
    return note;
  }

  function renderProfileGearPicker(gearType) {
    if (!profileGearPickerList) return;
    profileGearPickerList.innerHTML = "";
    if (gearType === "rod") {
      const ownedRods = rodItems.filter((rod) => player.ownedRods.includes(rod.id));
      ownedRods.forEach((rod) => {
        const unlocked = isUnlocked(rod);
        const row = document.createElement("div");
        row.className = "shopItem";
        row.innerHTML = `
          <div class="shopItemHeader">
            <div class="shopItemTitle">${rod.name}</div>
            <div class="shopItemMeta">Эффект: +${Math.round((rod.safeZoneBonus || 0) * 100)}% зона, +${Math.round((rod.rareBonus || 0) * 100)}% редкость</div>
          </div>
        `;
        const btn = document.createElement("button");
        btn.className = "invBtn btn--singleLine";
        if (!unlocked) {
          setButtonText(btn, "Закрыто");
          btn.disabled = true;
          row.classList.add("is-disabled");
          row.appendChild(createUnlockNote(rod.unlockLevel));
        } else {
          setButtonText(btn, player.rodTier === rod.id ? "Выбрано" : "Выбрать");
          btn.disabled = player.rodTier === rod.id;
        }
        btn.addEventListener("click", () => {
          if (!unlocked) return;
          player.rodTier = rod.id;
          save();
          updateHUD();
          updateProfileStatsUI();
          renderProfileGearPicker("rod");
          renderGearShop();
        });
        row.appendChild(btn);
        profileGearPickerList.appendChild(row);
      });
      return;
    }

    if (gearType === "line") {
      const ownedLines = lineItems.filter((line) => player.ownedLines.includes(line.id));
      ownedLines.forEach((line) => {
        const unlocked = isUnlocked(line);
        const riskDelta = Math.round((1 - (line.breakRiskMod || 1)) * 100);
        const riskText = `${riskDelta > 0 ? "+" : ""}${riskDelta}%`;
        const row = document.createElement("div");
        row.className = "shopItem";
        row.innerHTML = `
          <div class="shopItemHeader">
            <div class="shopItemTitle">${line.name}</div>
            <div class="shopItemMeta">Эффект: ${Math.round((line.rareBonus || 0) * 100)}% редкость, риск ${riskText}</div>
          </div>
          <div class="shopItemMeta">Макс. вес: ${line.maxKg} кг</div>
        `;
        const btn = document.createElement("button");
        btn.className = "invBtn btn--singleLine";
        if (!unlocked) {
          setButtonText(btn, "Закрыто");
          btn.disabled = true;
          row.classList.add("is-disabled");
          row.appendChild(createUnlockNote(line.unlockLevel));
        } else {
          setButtonText(btn, player.lineTier === line.id ? "Выбрано" : "Выбрать");
          btn.disabled = player.lineTier === line.id;
        }
        btn.addEventListener("click", () => {
          if (!unlocked) return;
          player.lineTier = line.id;
          save();
          updateHUD();
          updateProfileStatsUI();
          renderProfileGearPicker("line");
          renderGearShop();
        });
        row.appendChild(btn);
        profileGearPickerList.appendChild(row);
      });
      return;
    }

    if (gearType === "bait") {
      baitItems.forEach((bait) => {
        const unlocked = isUnlocked(bait);
        const count = player.baitInventory[bait.id] || 0;
        const row = document.createElement("div");
        row.className = "shopItem";
        const isActive = player.activeBaitId === bait.id && count > 0;
        row.innerHTML = `
          <div class="shopItemHeader">
            <div class="shopItemTitle">${bait.name}</div>
            <div class="shopItemMeta">В наличии: ${count}</div>
          </div>
          <div class="shopItemMeta">${bait.note}</div>
        `;
        const btn = document.createElement("button");
        btn.className = "invBtn btn--singleLine";
        if (!unlocked) {
          setButtonText(btn, "Закрыто");
          btn.disabled = true;
          row.classList.add("is-disabled");
          row.appendChild(createUnlockNote(bait.unlockLevel));
        } else if (isActive) {
          setButtonText(btn, "Выбрано");
          btn.disabled = true;
        } else if (count <= 0) {
          setButtonText(btn, "Нет в наличии");
          btn.disabled = true;
          row.classList.add("is-disabled");
        } else {
          setButtonText(btn, "Выбрать");
          btn.addEventListener("click", () => {
            player.activeBaitId = bait.id;
            save();
            updateProfileStatsUI();
            renderProfileGearPicker("bait");
            renderGearShop();
          });
        }
        row.appendChild(btn);
        profileGearPickerList.appendChild(row);
      });
    }
  }

  function refreshProfileGearPicker() {
    if (!activeProfileGear) return;
    renderProfileGearPicker(activeProfileGear);
  }

  function renderFishShopInventory() {
    if (!shopInvList || !shopInvEmpty) return;
    shopInvList.innerHTML = "";

    const items = sortInventory(inventory);

    if (items.length === 0) {
      shopInvEmpty.classList.remove("hidden");
      if (btnSellAll) btnSellAll.disabled = true;
    } else {
      shopInvEmpty.classList.add("hidden");
      if (btnSellAll) btnSellAll.disabled = false;
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
      meta.textContent = `${formatItemWeight(item)} • ${rarityLabels[item.rarity] || item.rarity}`;

      header.append(title, meta);

      const offer = document.createElement("div");
      offer.className = "shopItemMeta";
      offer.textContent = `Цена: ${formatCoins(item.sellValue)}`;

      const btnSell = document.createElement("button");
      btnSell.className = "invBtn btn--singleLine";
      setButtonText(btnSell, "Продать");
      btnSell.addEventListener("click", () => {
        executeSale(item);
      });

      card.append(header, offer, btnSell);
      shopInvList.appendChild(card);
    }
  }

  function executeSale(item) {
    inventory = inventory.filter((entry) => entry.id !== item.id);
    awardCoins(item.sellValue);
    stats.bestCoin = Math.max(stats.bestCoin, item.sellValue);
    updateHUD();
    save();
    renderFishShopInventory();
    renderInventory();
    showToast(`Продано: +${item.sellValue} монет`);
  }

  function updateGearTabs() {
    gearTabButtons.forEach((btn) => {
      const isActive = btn.dataset.gearTab === selectedGearTab;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });
    gearTabPanels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.gearPanel === selectedGearTab);
    });
  }

  function renderGearShop() {
    if (!gearShopSection) return;
    gearShopSection.classList.remove("hidden");
    updateGearTabs();

    if (baitList) {
      baitList.innerHTML = "";
      for (const bait of baitItems) {
        const unlocked = isUnlocked(bait);
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
        buyBtn.className = "invBtn btn--singleLine";
        setButtonText(buyBtn, "Купить");
        buyBtn.disabled = !unlocked || player.coins < bait.price;
        buyBtn.addEventListener("click", () => {
          if (!unlocked) return;
          if (player.coins < bait.price) return;
          player.coins -= bait.price;
          player.baitInventory[bait.id] = (player.baitInventory[bait.id] || 0) + 1;
          save();
          renderGearShop();
          updateHUD();
          updateProfileStatsUI();
          refreshProfileGearPicker();
        });
        const useBtn = document.createElement("button");
        useBtn.className = "invBtn secondary btn--singleLine";
        setButtonText(useBtn, player.activeBaitId === bait.id ? "Выбрано" : "Выбрать");
        useBtn.disabled = !unlocked || count <= 0;
        useBtn.addEventListener("click", () => {
          if (!unlocked) return;
          if (count <= 0) return;
          player.activeBaitId = bait.id;
          save();
          renderGearShop();
          updateProfileStatsUI();
          refreshProfileGearPicker();
        });
        actions.append(buyBtn, useBtn);
        item.appendChild(actions);
        if (!unlocked) {
          item.classList.add("is-disabled");
          item.appendChild(createUnlockNote(bait.unlockLevel));
        }
        baitList.appendChild(item);
      }
    }

    if (rodList) {
      rodList.innerHTML = "";
      for (const rod of rodItems) {
        const unlocked = isUnlocked(rod);
        const owned = player.ownedRods.includes(rod.id);
        const item = document.createElement("div");
        item.className = "shopItem";
        const purchasedTag = owned ? "<div class=\"shopItemMeta\">Куплено</div>" : "";
        item.innerHTML = `
          <div class="shopItemHeader">
            <div class="shopItemTitle">${rod.name}</div>
            <div class="shopItemMeta">${formatCoins(rod.price)}</div>
          </div>
          <div class="shopItemMeta">Эффект: +${Math.round((rod.safeZoneBonus || 0) * 100)}% зона натяжения, +${Math.round((rod.rareBonus || 0) * 100)}% редкость</div>
          ${purchasedTag}
        `;
        const btn = document.createElement("button");
        btn.className = "invBtn btn--singleLine";
        if (!unlocked) {
          setButtonText(btn, "Закрыто");
          btn.disabled = true;
        } else if (!owned) {
          setButtonText(btn, "Купить");
          btn.disabled = player.coins < rod.price;
        } else {
          setButtonText(btn, player.rodTier === rod.id ? "Выбрано" : "Выбрать");
          btn.disabled = player.rodTier === rod.id;
        }
        btn.addEventListener("click", () => {
          if (!unlocked) return;
          if (!owned) {
            if (player.coins < rod.price) return;
            player.coins -= rod.price;
            if (!player.ownedRods.includes(rod.id)) {
              player.ownedRods.push(rod.id);
            }
          }
          player.rodTier = rod.id;
          save();
          renderGearShop();
          updateHUD();
          updateProfileStatsUI();
          refreshProfileGearPicker();
        });
        item.appendChild(btn);
        if (!unlocked) {
          item.classList.add("is-disabled");
          item.appendChild(createUnlockNote(rod.unlockLevel));
        }
        rodList.appendChild(item);
      }
    }

    if (lineList) {
      lineList.innerHTML = "";
      for (const line of lineItems) {
        const unlocked = isUnlocked(line);
        const owned = player.ownedLines.includes(line.id);
        const item = document.createElement("div");
        item.className = "shopItem";
        const riskDelta = Math.round((1 - (line.breakRiskMod || 1)) * 100);
        const riskText = `${riskDelta > 0 ? "+" : ""}${riskDelta}%`;
        const purchasedTag = owned ? "<div class=\"shopItemMeta\">Куплено</div>" : "";
        item.innerHTML = `
          <div class="shopItemHeader">
            <div class="shopItemTitle">${line.name}</div>
            <div class="shopItemMeta">${formatCoins(line.price)}</div>
          </div>
          <div class="shopItemMeta">Макс. вес: ${line.maxKg} кг</div>
          <div class="shopItemMeta">Эффект: ${Math.round((line.rareBonus || 0) * 100)}% редкость, риск ${riskText}</div>
          ${purchasedTag}
        `;
        const btn = document.createElement("button");
        btn.className = "invBtn btn--singleLine";
        if (!unlocked) {
          setButtonText(btn, "Закрыто");
          btn.disabled = true;
        } else if (!owned) {
          setButtonText(btn, "Купить");
          btn.disabled = player.coins < line.price;
        } else {
          setButtonText(btn, player.lineTier === line.id ? "Выбрано" : "Выбрать");
          btn.disabled = player.lineTier === line.id;
        }
        btn.addEventListener("click", () => {
          if (!unlocked) return;
          if (!owned) {
            if (player.coins < line.price) return;
            player.coins -= line.price;
            if (!player.ownedLines.includes(line.id)) {
              player.ownedLines.push(line.id);
            }
          }
          player.lineTier = line.id;
          save();
          renderGearShop();
          updateHUD();
          updateProfileStatsUI();
          refreshProfileGearPicker();
        });
        item.appendChild(btn);
        if (!unlocked) {
          item.classList.add("is-disabled");
          item.appendChild(createUnlockNote(line.unlockLevel));
        }
        lineList.appendChild(item);
      }
    }

    renderShopStats();
  }
  function getLineStats() {
    const base = lineItems.find((line) => line.id === player.lineTier) || lineItems[0];
    return {
      ...base,
      breakThreshold: base.breakThreshold * (base.breakRiskMod || 1)
    };
  }

  function getRodStats() {
    return rodItems.find((rod) => rod.id === player.rodTier) || rodItems[0];
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
    active: false,
    from: "lake",
    to: "city",
    durationMs: 18 * 1000,
    t0: 0,
    progress: 0,
    arrivalHandled: false,
    messageText: "",
    messageUntil: 0
  };

  let travelPathLength = 0;

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
      label: "Трофейная",
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

  const isInScrollable = (el) => el && el.closest && el.closest(".scrollable, .modalBody");
  const isInGame = (el) => el && el.closest && el.closest("#game, #gameContainer, canvas");
  const activeGameModes = new Set(["CASTING", "WAITING", "BITE", "HOOKED", "REELING"]);
  const isGameplayActive = () => activeGameModes.has(game.mode);

  document.addEventListener("touchmove", (event) => {
    if (orientationLocked) {
      event.preventDefault();
      return;
    }
    const target = event.target;
    if (isInScrollable(target)) return;

    if (isInGame(target)) {
      if (isGameplayActive()) {
        event.preventDefault();
      }
      return;
    }

    event.preventDefault();
  }, { passive: false });

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

  function clearCityTooltip() {
    if (!cityTooltip) return;
    cityTooltip.classList.remove("is-visible");
  }

  function clearCityTooltipTimers() {
    if (cityTooltipTimer) window.clearTimeout(cityTooltipTimer);
    if (cityTooltipHideTimer) window.clearTimeout(cityTooltipHideTimer);
    cityTooltipTimer = null;
    cityTooltipHideTimer = null;
  }

  function showCityTooltip(target) {
    if (!cityTooltip || !cityScene || !target) return;
    const label = target.dataset.label || target.getAttribute("aria-label") || "";
    if (!label) return;
    const targetRect = target.getBoundingClientRect();
    const sceneRect = cityScene.getBoundingClientRect();
    const left = targetRect.left - sceneRect.left + targetRect.width / 2;
    const top = targetRect.top - sceneRect.top;
    cityTooltip.textContent = label;
    cityTooltip.style.left = `${left}px`;
    cityTooltip.style.top = `${top}px`;
    cityTooltip.classList.add("is-visible");
    if (cityTooltipHideTimer) window.clearTimeout(cityTooltipHideTimer);
    cityTooltipHideTimer = window.setTimeout(() => {
      clearCityTooltip();
    }, 1200);
  }

  function initCityHitboxes() {
    const sceneMap = {
      fish: SCENE_BUILDING_FISHSHOP,
      gear: SCENE_BUILDING_GEARSHOP,
      trophy: SCENE_BUILDING_TROPHY
    };
    cityHitboxes.forEach((hitbox) => {
      hitbox.addEventListener("pointerdown", (event) => {
        if (isFighting) return;
        if (currentScene !== SCENE_CITY) return;
        stopUiEvent(event);
        hitbox.classList.add("is-pressed");
        clearCityTooltipTimers();
        if (navigator.vibrate) {
          navigator.vibrate(12);
        }
        cityTooltipTimer = window.setTimeout(() => {
          showCityTooltip(hitbox);
        }, 320);
      });
      const clearPress = () => {
        hitbox.classList.remove("is-pressed");
        clearCityTooltipTimers();
        clearCityTooltip();
      };
      hitbox.addEventListener("pointerup", clearPress);
      hitbox.addEventListener("pointerleave", clearPress);
      hitbox.addEventListener("pointercancel", clearPress);
      hitbox.addEventListener("click", (event) => {
        if (isFighting) return;
        if (currentScene !== SCENE_CITY) return;
        stopUiEvent(event);
        const sceneId = sceneMap[hitbox.dataset.scene];
        if (sceneId) openShop(sceneId);
      });
    });
  }

  function showOverlay() {
    overlay?.classList.remove("hidden");
    updateModalLayerState();
  }
  function hideOverlay() {
    overlay?.classList.add("hidden");
    updateModalLayerState();
  }
  function setOverlayText(text) {
    if (ovText) ovText.textContent = text;
  }

  function setTravelOverlayVisible(visible) {
    if (!travelOverlay) return;
    travelOverlay.classList.toggle("hidden", !visible);
    travelOverlay.setAttribute("aria-hidden", visible ? "false" : "true");
    updateModalLayerState();
  }

  function renderTravelMessage(now = Date.now()) {
    if (!travelMessage) return;
    const isVisible = Boolean(travel.messageText) && now < travel.messageUntil;
    if (isVisible) {
      travelMessage.textContent = travel.messageText;
    } else {
      travelMessage.textContent = "";
    }
    travelMessage.classList.toggle("is-visible", isVisible);
  }

  function setTravelMessage(text, durationMs) {
    travel.messageText = text;
    travel.messageUntil = text ? Date.now() + durationMs : 0;
    renderTravelMessage();
  }

  function setTravelUiLocked(locked) {
    if (!app) return;
    const controls = app.querySelectorAll("button, select, input, textarea");
    controls.forEach((control) => {
      if (locked) {
        if (!control.disabled) {
          control.disabled = true;
          control.dataset.travelLocked = "true";
        }
      } else if (control.dataset.travelLocked === "true") {
        control.disabled = false;
        delete control.dataset.travelLocked;
      }
    });
    if (uiLayer) {
      uiLayer.style.pointerEvents = locked ? "none" : "";
    }
    if (gameLayer) {
      gameLayer.style.pointerEvents = locked ? "none" : "";
    }
    app.classList.toggle("travel-lock", locked);
  }

  function updateTravelUi() {
    if (!travel.active) return;
    const now = Date.now();
    travel.progress = clamp((now - travel.t0) / travel.durationMs, 0, 1);
    const remainingMs = Math.max(0, travel.durationMs - (now - travel.t0));
    const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
    if (travelTimer) {
      const m = Math.floor(remainingSec / 60).toString().padStart(2, "0");
      const s = Math.floor(remainingSec % 60).toString().padStart(2, "0");
      travelTimer.textContent = `${m}:${s}`;
    }
    if (travelMessage) {
      const arrivalText = travel.to === "city" ? "Вы прибыли в город" : "Вы прибыли к озеру";
      let message = "";
      if (remainingMs > 0 && remainingMs <= 2000) {
        message = arrivalText;
      } else if (travel.messageText && now < travel.messageUntil) {
        message = travel.messageText;
      }
      travelMessage.textContent = message;
      travelMessage.classList.toggle("is-visible", Boolean(message));
    }
    if (travelPathBase && travelPathProgress && travelMarker) {
      if (!travelPathLength) {
        travelPathLength = travelPathBase.getTotalLength();
      }
      const displayProgress = travel.to === "lake" ? 1 - travel.progress : travel.progress;
      const progressLength = travelPathLength * displayProgress;
      travelPathProgress.style.strokeDasharray = `${progressLength} ${travelPathLength}`;
      travelPathProgress.style.strokeDashoffset = "0";
      const point = travelPathBase.getPointAtLength(progressLength);
      travelMarker.setAttribute("cx", point.x);
      travelMarker.setAttribute("cy", point.y);
    }
  }

  function finishTravel() {
    if (!travel.active || travel.arrivalHandled) return;
    travel.arrivalHandled = true;
    const destination = travel.to === "city" ? SCENE_CITY : SCENE_LAKE;
    transitionTo(destination);
    if (destination === SCENE_LAKE) {
      setHint("Тап: заброс", 1.2);
    }
    setTravelOverlayVisible(false);
    setTravelUiLocked(false);
    travel.active = false;
    travel.t0 = 0;
    travel.progress = 0;
    travel.arrivalHandled = false;
    travel.messageText = "";
    travel.messageUntil = 0;
    if (travelMessage) {
      travelMessage.textContent = "";
      travelMessage.classList.remove("is-visible");
    }
  }

  function startTravel(from, to) {
    if (isFighting) return;
    if (travel.active) return;
    const now = Date.now();
    travel.active = true;
    travel.from = from;
    travel.to = to;
    travel.t0 = now;
    travel.progress = 0;
    travel.arrivalHandled = false;
    setTravelOverlayVisible(true);
    setTravelUiLocked(true);
    const message = to === "city" ? "Поездка в город" : "Возвращаемся к озеру";
    setTravelMessage(message, 5000);
    updateTravelUi();
  }

  let catchOverlayVisible = false;
  let catchOverlayHideTimer = null;
  let findingOverlayVisible = false;
  let findingOverlayHideTimer = null;

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
      updateModalLayerState();
      return;
    }
    catchOverlay.classList.remove("is-visible");
    catchOverlay.classList.add("is-hiding");
    catchOverlayHideTimer = window.setTimeout(() => {
      if (!catchOverlayVisible) {
        catchOverlay.classList.add("hidden");
        catchOverlay.classList.remove("is-hiding");
        updateModalLayerState();
      }
    }, 220);
  }

  function setFindingOverlayVisible(visible) {
    if (!findingOverlay) return;
    if (findingOverlayVisible === visible) return;
    findingOverlayVisible = visible;
    if (findingOverlayHideTimer) window.clearTimeout(findingOverlayHideTimer);
    if (visible) {
      findingOverlay.classList.remove("hidden");
      findingOverlay.classList.remove("is-hiding");
      requestAnimationFrame(() => {
        findingOverlay.classList.add("is-visible");
      });
      updateModalLayerState();
      return;
    }
    findingOverlay.classList.remove("is-visible");
    findingOverlay.classList.add("is-hiding");
    findingOverlayHideTimer = window.setTimeout(() => {
      if (!findingOverlayVisible) {
        findingOverlay.classList.add("hidden");
        findingOverlay.classList.remove("is-hiding");
        updateModalLayerState();
      }
    }, 220);
  }

  function setScene(sceneId) {
    if (sceneId !== SCENE_LAKE) {
      cancelWaitingState();
    }
    currentScene = sceneId;
    const isCityScene = [SCENE_CITY, SCENE_BUILDING_FISHSHOP, SCENE_BUILDING_TROPHY, SCENE_BUILDING_GEARSHOP].includes(sceneId);
    if (app) app.dataset.scene = isCityScene ? "city" : "lake";
    if (cityScene) {
      cityScene.setAttribute("aria-hidden", isCityScene ? "false" : "true");
      cityScene.style.pointerEvents = sceneId === SCENE_CITY ? "auto" : "none";
    }
    clearCityTooltipTimers();
    clearCityTooltip();
    setCatchOverlayVisible(sceneId === SCENE_CATCH_MODAL);
    setFindingOverlayVisible(sceneId === SCENE_FINDING_MODAL);
    cityHud?.classList.toggle("hidden", sceneId !== SCENE_CITY);
    shopOverlay?.classList.toggle("hidden", ![SCENE_BUILDING_FISHSHOP, SCENE_BUILDING_GEARSHOP, SCENE_BUILDING_TROPHY].includes(sceneId));
    btnCity?.classList.toggle("hidden", sceneId !== SCENE_LAKE);
    btnInventory?.classList.toggle("hidden", sceneId !== SCENE_LAKE);
    btnJournal?.classList.toggle("hidden", sceneId !== SCENE_LAKE);
    btnStar?.classList.toggle("hidden", sceneId !== SCENE_LAKE);
    if (rareBoostHud) rareBoostHud.classList.toggle("hidden", sceneId !== SCENE_LAKE || !collectorRodUnlocked);
    if (sceneId !== SCENE_LAKE && invOverlay) invOverlay.classList.add("hidden");
    if (sceneId !== SCENE_LAKE && trashOverlay) {
      trashOverlay.classList.add("hidden");
      trashOverlay.classList.remove("is-visible");
    }
    updateModalLayerState();
    updateLayerVisibility();
  }

  function transitionTo(sceneId) {
    if (!sceneFade) {
      setScene(sceneId);
      return;
    }
    sceneFade.classList.remove("hidden");
    sceneFade.classList.add("active");
    updateModalLayerState();
    setTimeout(() => {
      setScene(sceneId);
      sceneFade.classList.remove("active");
      setTimeout(() => {
        sceneFade.classList.add("hidden");
        updateModalLayerState();
      }, 320);
    }, 220);
  }

  function startGame() {
    if (!profile) {
      openProfileSetup();
      return;
    }
    hideOverlay();
    setFightState(false);
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
    game.biteAt = randomInt(BITE_DELAY_RANGE_MS.min, BITE_DELAY_RANGE_MS.max) / 1000;
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

  function cancelWaitingState() {
    if (game.mode !== "WAITING") return;
    game.mode = "IDLE";
    game.t = 0;
    bobber.visible = false;
    bobber.inWater = false;
    game.catch = null;
    setFishing(false);
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
    setFightState(true);
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
    if (catchImage) {
      const speciesId = normalizeSpeciesId(catchData.speciesId);
      const iconPath = !isTrash ? (catchData.iconPath || fishIcons[speciesId]) : null;
      if (iconPath) {
        catchImage.src = iconPath;
        catchImage.alt = catchData.name;
        catchImage.classList.remove("hidden");
      } else {
        catchImage.removeAttribute("src");
        catchImage.classList.add("hidden");
      }
      if (catchImageSlot) {
        catchImageSlot.classList.toggle("is-empty", !iconPath);
      }
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

  function openFindingModal(catchData, { alreadyFound = false, bonus = 0 } = {}) {
    if (!catchData) return;
    const details = TRASH_DETAILS[catchData.trashId] || {};
    const iconPath = catchData.iconPath || details.iconPath || TRASH_ICON_PATHS[catchData.trashId];
    const name = details.titleRu || catchData.name || "Находка";
    pendingFinding = catchData;
    if (findingTitle) {
      findingTitle.textContent = alreadyFound ? "Повторная находка" : "Выудил что-то интересное";
    }
    if (findingName) findingName.textContent = name;
    if (findingStory) {
      const story = (details.storyRu || catchData.story || "").trim();
      const bonusLine = bonus > 0 ? `Бонус: +${bonus} монет.` : "";
      const nextStory = [story, bonusLine].filter(Boolean).join(" ");
      findingStory.textContent = nextStory;
      findingStory.classList.toggle("hidden", !nextStory);
    }
    if (findingImage) {
      if (iconPath) {
        findingImage.src = iconPath;
        findingImage.alt = name;
        findingImage.classList.remove("hidden");
      } else {
        findingImage.removeAttribute("src");
        findingImage.classList.add("hidden");
      }
    }
    if (findingImageSlot) findingImageSlot.classList.toggle("is-empty", !iconPath);
    transitionTo(SCENE_FINDING_MODAL);
  }

  function land() {
    if (!game.catch) return;
    setFightState(false);

    if (game.catch.catchType === "trash") {
      const trashCatch = game.catch;
      game.mode = "LANDED";
      game.t = 0;
      beep(660, 0.08, 0.06);
      setMsg(`Нашёл: ${game.catch.name}.`, 1.8);
      revealSystem.reset();
      scheduleRevealHintHide(260);
      const awardDetails = awardTrashCatch(trashCatch) || {};
      openFindingModal(trashCatch, awardDetails);
      game.catch = null;
      return;
    }

    updateCatchStats(game.catch);
    const xpResult = progression.awardXP({
      speciesId: game.catch.speciesId,
      rarity: game.catch.rarity,
      weightKg: game.catch.weightKg
    });
    consumeBait();
    updateHUD();
    const unlockAdjusted = enforceGearUnlocks();
    showXPGain(xpResult);
    updateLeaderboardsFromStats();
    if (xpResult.leveledUp) {
      renderGearShop();
      refreshProfileGearPicker();
    }
    if (unlockAdjusted) {
      updateHUD();
    }
    save();
    checkQuestCompletion(game.catch);

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
    if (orientationLocked) return;
    e.preventDefault();
    pointerDown = true;
    swipeDone = false;
    const p = getXY(e);
    startX = lastX = p.x;
    startY = lastY = p.y;

    if ([SCENE_CITY, SCENE_BUILDING_FISHSHOP, SCENE_BUILDING_TROPHY, SCENE_BUILDING_GEARSHOP].includes(currentScene)) {
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

    if (game.mode === "BITE") {
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
    if (orientationLocked) return;
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
    if (orientationLocked) return;
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
    if (orientationLocked) return;
    if (pendingOrientationPause > 0) {
      if (travel.active) {
        travel.t0 += pendingOrientationPause;
        if (travel.messageUntil) {
          travel.messageUntil += pendingOrientationPause;
        }
      }
      pendingOrientationPause = 0;
    }
    scene.t += dt;
    game.t += dt;
    game.lastTap += dt;
    if (game.msgT > 0) game.msgT -= dt;

    if (travel.active) {
      if (Date.now() >= travel.t0 + travel.durationMs) {
        finishTravel();
      } else {
        updateTravelUi();
      }
      return;
    }

    if (currentScene !== SCENE_LAKE && currentScene !== SCENE_CATCH_MODAL && currentScene !== SCENE_FINDING_MODAL) {
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
        setFightState(false);
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
        setFightState(false);
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
    if (currentScene === SCENE_CITY || currentScene === SCENE_BUILDING_FISHSHOP || currentScene === SCENE_BUILDING_TROPHY || currentScene === SCENE_BUILDING_GEARSHOP) {
      ctx.clearRect(0, 0, W, H);
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
    updateLeaderboardsFromStats();
    updateProfileStatsUI();
    initCityHitboxes();
    updateOrientationLock();
    if (orientationLocked) {
      layout();
    }
    renderInventory();
    renderTrashJournal();
    setScene(SCENE_LAKE);
    setLakeState("idle");
    startPlaySession();
    if (!profile) {
      openProfileSetup();
    }
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
