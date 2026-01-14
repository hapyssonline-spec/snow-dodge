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
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d", { alpha: true });
  const lakeScene = document.getElementById("lakeScene");
  const rodLayer = document.getElementById("rodLayer");
  const bobberLayer = document.getElementById("bobberLayer");

  const coinsEl = document.getElementById("coins");
  const fishEl = document.getElementById("fish");
  const subtitleEl = document.getElementById("subtitle");
  const chipHint = document.getElementById("chipHint");

  const overlay = document.getElementById("overlay");
  const ovText = document.getElementById("ovText");
  const btnPlay = document.getElementById("btnPlay");
  const btnReset = document.getElementById("btnReset");
  const btnMute = document.getElementById("btnMute");
  const btnInventory = document.getElementById("btnInventory");
  const btnCity = document.getElementById("btnCity");

  const invOverlay = document.getElementById("invOverlay");
  const btnInvClose = document.getElementById("btnInvClose");
  const invSort = document.getElementById("invSort");
  const invList = document.getElementById("invList");
  const invEmpty = document.getElementById("invEmpty");

  const catchOverlay = document.getElementById("catchOverlay");
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

  const sceneFade = document.getElementById("sceneFade");
  const toast = document.getElementById("toast");

  // ===== Helpers =====
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);

  const formatKg = (value) => `${value.toFixed(2)} кг`;
  const formatCoins = (value) => `${value} монет`;
  const formatPercent = (value) => `${Math.round(value)}%`;

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
      x: rect.right - rect.width * 0.08,
      y: rect.top + rect.height * 0.16
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

  // ===== Tension + progress balance (REELING) =====
  const TENSION_RELAX = 0.045;
  const TENSION_RELAX_POWER = 0.003;
  const TENSION_MAX = 1.22;
  const TENSION_SWEET_MIN = 0.42;
  const TENSION_SWEET_MAX = 0.72;
  const TENSION_RED_ZONE = 0.84;

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

  const rarityLabels = {
    common: "обычная",
    uncommon: "необычная",
    rare: "редкая",
    epic: "эпическая",
    legendary: "легендарная"
  };

  const rarityPower = {
    common: 0.0,
    uncommon: 0.05,
    rare: 0.1,
    epic: 0.16,
    legendary: 0.22
  };

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

  function rollFish() {
    const bait = baitItems.find((item) => item.id === player.activeBaitId);
    const rollTable = fishSpeciesTable.map((fish) => {
      const rodAllowed = fish.minRodTier <= player.rodTier;
      if (!rodAllowed) return { fish, chance: 0 };
      let mult = 1.0;
      if (bait) {
        mult = bait.boost.includes(fish.id) ? 2.0 : 0.8;
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

  function buildCatch() {
    const species = rollFish();
    const rawWeight = triangular(species.minKg, species.modeKg, species.maxKg);
    const weightKg = Math.round(clamp(rawWeight, species.minKg, species.maxKg) * 100) / 100;
    const sellValue = Math.round(weightKg * species.pricePerKg);
    const weightRatio = (weightKg - species.minKg) / (species.maxKg - species.minKg);
    const power = clamp(0.32 + weightRatio * 0.48 + (rarityPower[species.rarity] || 0), 0.25, 0.9);

    return {
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

  btnMute?.addEventListener("click", () => {
    muted = !muted;
    btnMute.textContent = `Звук: ${muted ? "Выкл" : "Вкл"}`;
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
  const STORAGE_VERSION = 3;

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
    lineTier: 1
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
        const savedReps = obj.reps || {};
        reps.fishShop = Number(savedReps.fishShop ?? reps.fishShop);
        reps.trophy = Number(savedReps.trophy ?? reps.trophy);
        reps.gearShop = Number(savedReps.gearShop ?? reps.gearShop);
        citySession = Object.assign(citySession, obj.citySession || {});
        activeQuests = Array.isArray(obj.quests) ? obj.quests : [];
      } else {
        player.coins = stats.coins;
      }
      stats.coins = player.coins;
      if (btnMute) btnMute.textContent = `Звук: ${muted ? "Выкл" : "Вкл"}`;
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
        player: {
          coins: player.coins,
          activeBaitId: player.activeBaitId,
          baitInventory: player.baitInventory,
          rodTier: player.rodTier,
          lineTier: player.lineTier
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
    reps.fishShop = 30;
    reps.trophy = 30;
    reps.gearShop = 30;
    activeQuests = [];
    save();
    updateHUD();
    renderInventory();
  }

  btnReset?.addEventListener("click", () => {
    resetProgress();
    setOverlayText("Прогресс сброшен. Нажми «Играть».");
  });

  function updateHUD() {
    if (coinsEl) coinsEl.textContent = String(player.coins);
    if (fishEl) fishEl.textContent = String(stats.fish);
  }

  function openInventory() {
    invOverlay?.classList.remove("hidden");
    if (invSort) invSort.value = inventorySort;
    renderInventory();
  }

  function closeInventory() {
    invOverlay?.classList.add("hidden");
  }

  btnInventory?.addEventListener("click", () => {
    if (currentScene !== SCENE_LAKE) return;
    openInventory();
  });

  btnInvClose?.addEventListener("click", () => {
    closeInventory();
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
    setHint(`Тапни по воде, чтобы забросить. Приманка: ${getActiveBaitLabel()}`);
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
    setHint(`Тапни по воде, чтобы забросить. Приманка: ${getActiveBaitLabel()}`);
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
    setHint(`Тапни по воде, чтобы забросить. Приманка: ${getActiveBaitLabel()}`);
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
    // reel mechanics
    progress: 0,
    need: 1.0,
    tension: 0.35,    // 0..1
    tensionVel: 0.0,
    reelHeat: 0,
    surgeSeed: 0,
    reelDecay: 0.0,
    // input
    lastTap: 999,
    // messages
    msg: "",
    msgT: 0,
  };

  function setHint(text) {
    if (chipHint) chipHint.textContent = text;
  }

  function setSubtitle(text) {
    if (subtitleEl) subtitleEl.textContent = text;
  }

  function setMsg(text, seconds = 1.2) {
    game.msg = text;
    game.msgT = seconds;
    setHint(text);
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

  function setScene(sceneId) {
    currentScene = sceneId;
    catchOverlay?.classList.toggle("hidden", sceneId !== SCENE_CATCH_MODAL);
    travelHud?.classList.toggle("hidden", sceneId !== SCENE_TRAVEL);
    cityHud?.classList.toggle("hidden", sceneId !== SCENE_CITY);
    shopOverlay?.classList.toggle("hidden", ![SCENE_BUILDING_FISHSHOP, SCENE_BUILDING_TROPHY, SCENE_BUILDING_GEARSHOP].includes(sceneId));
    btnCity?.classList.toggle("hidden", sceneId !== SCENE_LAKE);
    btnInventory?.classList.toggle("hidden", sceneId !== SCENE_LAKE);
    if (sceneId !== SCENE_LAKE && invOverlay) invOverlay.classList.add("hidden");
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
    setScene(SCENE_LAKE);
    setSubtitle("Тап — заброс. Поклёвка → свайп вверх. Тапы — выматывать.");
    setHint(`Тапни по воде, чтобы забросить. Приманка: ${getActiveBaitLabel()}`);
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
    setMsg("Ждём поклёвку…", 1.1);
  }

  function enterBite() {
    game.mode = "BITE";
    game.t = 0;
    triggerBite();
    beep(820, 0.08, 0.05);
    setMsg("ПОКЛЁВКА! Свайп вверх (подсечка)!", 1.0);
  }

  function hook() {
    if (game.mode !== "BITE") return;
    triggerStrike();

    const catchData = buildCatch();
    game.catch = catchData;
    game.rarity = catchData.rarityLabel;
    game.fishPower = catchData.power;
    game.reward = catchData.sellValue;
    const line = getLineStats();

    // reel mechanics
    game.progress = 0;
    game.need = clamp(0.95 + game.fishPower * 0.65, 1.0, 1.55);
    game.tension = (0.48 + game.fishPower * 0.12) * line.tensionMult;
    game.tensionVel = 0;
    game.reelHeat = 0;
    game.surgeSeed = rand(0, Math.PI * 2);
    game.reelDecay = 0.10 + game.fishPower * 0.22;

    game.mode = "HOOKED";
    game.t = 0;
    beep(960, 0.06, 0.06);
    setMsg(`Подсечка! Рыба: ${catchData.name} (${catchData.rarityLabel}).`, 1.1);
  }

  function startReel() {
    game.mode = "REELING";
    game.t = 0;
    game.lastTap = 999;
    setFishing(true);
    setMsg("Тапай, чтобы выматывать. Следи за натяжением!", 1.2);
  }

  function openCatchModal(catchData) {
    if (!catchData) return;
    pendingCatch = catchData;
    if (catchName) catchName.textContent = catchData.name;
    if (catchRarity) {
      catchRarity.textContent = catchData.rarityLabel;
      catchRarity.className = `badge badge-${catchData.rarity}`;
    }
    if (catchWeight) catchWeight.textContent = formatKg(catchData.weightKg);
    if (catchStory) catchStory.textContent = catchData.story;
    if (catchFullPrice) catchFullPrice.textContent = formatCoins(catchData.sellValue);
    const discounted = Math.round(catchData.sellValue * 0.7);
    if (catchDiscountPrice) catchDiscountPrice.textContent = formatCoins(discounted);
    if (catchTrophyWrap) {
      catchTrophyWrap.classList.toggle("hidden", !catchData.weightKg || catchData.weightKg < 5.0);
    }
    if (catchTrophyToggle) catchTrophyToggle.checked = false;
    transitionTo(SCENE_CATCH_MODAL);
  }

  function land() {
    if (!game.catch) return;

    stats.fish += 1;
    updateHUD();

    game.mode = "LANDED";
    game.t = 0;
    beep(660, 0.08, 0.06);
    setMsg(`Поймал: ${game.catch.name} ${formatKg(game.catch.weightKg)}.`, 1.8);

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
      // reel tap: original balance (steady gains, no sweet-spot multiplier)
      game.lastTap = 0;
      const rod = getRodStats();
      const baseGain = 0.092 - game.fishPower * 0.020;
      const gain = Math.max(0.045, baseGain + rod.reelBonus * 0.9);
      game.progress += gain;

      game.reelHeat = clamp(game.reelHeat + 0.18, 0, 1);
      const line = getLineStats();
      const weightKg = game.catch?.weightKg || 0;
      const weightPenalty = weightKg > line.maxKg ? (1 + (weightKg - line.maxKg) * 0.1) : 1;
      const bump = (0.018 + game.fishPower * 0.022) * (0.65 + game.reelHeat * 0.7) * weightPenalty * line.tensionMult;
      game.tension += bump;

      beep(520, 0.03, 0.03);
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
        bobber.wave += dt * (1.4 + game.fishPower * 0.7);
        const amp = (game.mode === "BITE") ? 4.6 : (game.mode === "REELING" ? 2.2 : 1.4);
        bobber.y = scene.lakeY + 18 + Math.sin(bobber.wave * 6.0) * amp;
        bobber.x += Math.sin(bobber.wave * 1.2) * 0.25;
      }
      placeBobberAt(bobber.x, bobber.y);
    }

    // state transitions
    if (game.mode === "WAITING") {
      if (game.t >= game.biteAt) enterBite();
    }

    if (game.mode === "BITE") {
      if (game.t > game.biteWindow) {
        game.mode = "IDLE";
        game.t = 0;
        bobber.visible = false;
        bobber.inWater = false;
        game.catch = null;
        setFishing(false);
        beep(220, 0.10, 0.05);
        setMsg("Не успел подсечь. Тап — забросить снова.", 1.6);
      }
    }

    if (game.mode === "HOOKED") {
      if (game.t > 0.25) startReel();
    }

    if (game.mode === "REELING") {
      const line = getLineStats();
      game.reelHeat = clamp(game.reelHeat - dt * 0.45, 0, 1);

      const baseRelax = TENSION_RELAX - game.fishPower * TENSION_RELAX_POWER;
      const idleBonus = clamp((game.lastTap - 0.15) / 0.65, 0, 1);
      const relax = baseRelax * (0.6 + idleBonus * 2.0);
      game.tension = clamp(game.tension - relax * dt, 0, TENSION_MAX);

      // progress decay (original balance)
      const decayBoost = 0.6 + Math.min(1.0, game.lastTap * 0.8);
      const decay = game.reelDecay * decayBoost * dt * 0.5;
      game.progress = Math.max(0, game.progress - decay);

      // moving bobber toward shore with progress
      const p = clamp(game.progress / game.need, 0, 1);
      bobber.x = lerp(W * 0.78, W * 0.42, p);
      bobber.y = scene.lakeY + 18 + Math.sin(bobber.wave * 6.0) * 1.6;

      // lose conditions
      if (game.tension >= line.breakThreshold) {
        game.mode = "IDLE";
        game.t = 0;
        bobber.visible = false;
        bobber.inWater = false;
        game.catch = null;
        setFishing(false);
        beep(220, 0.10, 0.05);
        setMsg("Леска лопнула. Тап — забросить снова.", 1.6);
        return;
      }
      if (game.tension <= 0) {
        game.mode = "IDLE";
        game.t = 0;
        bobber.visible = false;
        bobber.inWater = false;
        game.catch = null;
        setFishing(false);
        beep(220, 0.10, 0.05);
        setMsg("Натяжение упало до нуля. Рыбалка сорвалась.", 1.6);
        return;
      }

      // win condition
      if (game.progress >= game.need) {
        land();
        return;
      }

      // guidance hint based on tension
      if (game.t % 0.5 < dt) {
        if (game.tension > TENSION_RED_ZONE) setHint("Красная зона — пауза, не тапай!");
        else if (game.tension < TENSION_SWEET_MIN - 0.08) setHint("Слишком слабое натяжение — рыба уходит.");
        else if (game.tension > TENSION_SWEET_MAX + 0.08) setHint("Слишком туго — дай леске отдохнуть.");
        else setHint("Держи натяжение в зелёной зоне.");
      }
    }

    if (game.mode === "LANDED") {
      if (game.t > 1.0) {
        game.mode = "IDLE";
        game.t = 0;
        bobber.visible = false;
        bobber.inWater = false;
        setFishing(false);
        setHint("Тапни по воде, чтобы забросить.");
      }
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

    if (bobber.visible) {
      const rodTip = getRodTipPoint();
      if (rodTip) {
        ctx.strokeStyle = "rgba(230,240,255,0.65)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(rodTip.x, rodTip.y);
        const midX = (rodTip.x + bobber.x) * 0.5;
        const midY = (rodTip.y + bobber.y) * 0.5 + 30;
        ctx.quadraticCurveTo(midX, midY, bobber.x, bobber.y);
        ctx.stroke();
      }
    }

    // UI meters on canvas
    if (game.mode === "REELING") {
      drawMeters();
    }

    // short center prompt
    drawPrompt();
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

  function drawPrompt() {
    const show =
      (game.mode === "IDLE") ? "Тап: заброс" :
      (game.mode === "WAITING") ? "Ждём…" :
      (game.mode === "BITE") ? "Свайп вверх!" :
      (game.mode === "REELING") ? "" :
      "";

    if (!show) return;

    const x = W * 0.5;
    const y = scene.lakeY - 72;

    ctx.save();
    ctx.font = "700 16px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const m = ctx.measureText(show);
    const w = Math.min(W - 24, m.width + 28);
    const h = 36;

    ctx.globalAlpha = 0.75;
    ctx.fillStyle = "#0b0f14";
    roundRect(x - w / 2, y - h / 2, w, h, 12);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.fillStyle = "#eaf2ff";
    ctx.fillText(show, x, y);
    ctx.restore();
  }

  function drawMeters() {
    const x = W * 0.5;
    const y = scene.lakeY - 24;
    const barW = Math.min(360, W * 0.82);
    const barH = 14;

    const catchData = game.catch;
    const catchName = catchData ? `${catchData.name} • ${formatKg(catchData.weightKg)}` : "Рыба";

    // Progress (pulling fish)
    const p = clamp(game.progress / game.need, 0, 1);
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = "#0b0f14";
    roundRect(x - barW / 2, y - barH / 2, barW, barH, 10);
    ctx.fill();

    ctx.globalAlpha = 0.90;
    ctx.fillStyle = "#7bd3ff";
    roundRect(x - barW / 2 + 2, y - barH / 2 + 2, (barW - 4) * p, barH - 4, 8);
    ctx.fill();

    // Tension bar below
    const ty = y + 24;
    const t = clamp(game.tension, 0, 1);
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = "#0b0f14";
    roundRect(x - barW / 2, ty - barH / 2, barW, barH, 10);
    ctx.fill();

    // green zone
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#66e6a0";
    const gz0 = TENSION_SWEET_MIN, gz1 = TENSION_SWEET_MAX;
    roundRect(x - barW / 2 + 2 + (barW - 4) * gz0, ty - barH / 2 + 2, (barW - 4) * (gz1 - gz0), barH - 4, 8);
    ctx.fill();

    // tension fill with color
    ctx.globalAlpha = 0.92;
    const color =
      (t < TENSION_SWEET_MIN - 0.06) ? "#ffd166" :
      (t > TENSION_SWEET_MAX + 0.08) ? "#ff6b6b" :
      "#66e6a0";
    ctx.fillStyle = color;
    roundRect(x - barW / 2 + 2, ty - barH / 2 + 2, (barW - 4) * t, barH - 4, 8);
    ctx.fill();

    // labels
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#eaf2ff";
    ctx.font = "700 12px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(`Выматывание: ${(p * 100 | 0)}% • ${catchName}`, x, y - 12);
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

    update(dt);
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
    updateHUD();
    setVhVar();
    resize();
    renderInventory();
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
