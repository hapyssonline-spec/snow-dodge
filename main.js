(() => {
  "use strict";

  // ===== DOM =====
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d", { alpha: false });

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

  const invOverlay = document.getElementById("invOverlay");
  const btnInvClose = document.getElementById("btnInvClose");
  const invSort = document.getElementById("invSort");
  const invList = document.getElementById("invList");
  const invEmpty = document.getElementById("invEmpty");

  // ===== Helpers =====
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);

  const formatKg = (value) => `${value.toFixed(2)} кг`;
  const formatCoins = (value) => `${value} монет`;

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

  // ===== Tension balance (REELING) =====
  const TENSION_PULL_BASE = 0.10;
  const TENSION_PULL_POWER = 0.16;
  const TENSION_RELAX_BASE = 0.20;
  const TENSION_RELAX_POWER = 0.05;
  const RELAX_MULT_EARLY = 1.7;
  const RELAX_MULT_LATE = 2.4;
  const TAP_TENSION_BUMP_BASE = 0.009;
  const TAP_TENSION_BUMP_POWER = 0.006;
  const TAP_TENSION_BUMP_HIGH_BASE = 0.015;
  const TAP_TENSION_BUMP_HIGH_POWER = 0.010;

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
      story: "Серебристая тень у кромки льда. Говорят, плотва первая проверяет приманку и первая же выдаёт рыбака."
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
      story: "Полосатый разбойник. Часто идёт стаей и любит короткие резкие рывки."
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
      story: "Упрямый и терпеливый. Старики говорят: карась клюёт тогда, когда ты уже почти ушёл."
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
      story: "Тяжёлый, ‘плоский’ и молчаливый. Вытаскивать его — как поднимать мокрую доску."
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
      story: "Северная торпеда. Может стоять неподвижно минутами, а потом ударить как молния."
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
      story: "Ночной охотник. У него холодный взгляд и характер — будто лёд под сапогом."
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
      story: "Чистая вода, быстрые струи. Форель будто создана для побега — её надо ‘переиграть’."
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
      story: "Дно его дом. Если сом клюнул — ты почувствуешь, как будто за леску держится сама глубина."
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
      story: "Реликт прошлого. Осётр — рыба, которая помнит ‘до льда’, и не любит торопливых."
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
      story: "Её видели единицы. Говорят, она выходит на свет луны и берёт приманку только у тех, кто умеет ждать."
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

  function rollFish() {
    const r = Math.random();
    let acc = 0;
    for (const fish of fishSpeciesTable) {
      acc += fish.chance;
      if (r <= acc) return fish;
    }
    return fishSpeciesTable[fishSpeciesTable.length - 1];
  }

  function buildCatch() {
    const species = rollFish();
    const rawWeight = triangular(species.minKg, species.modeKg, species.maxKg);
    const weightKg = Math.round(clamp(rawWeight, species.minKg, species.maxKg) * 100) / 100;
    const sellValue = Math.round(weightKg * species.pricePerKg);
    const weightRatio = (weightKg - species.minKg) / (species.maxKg - species.minKg);
    const power = clamp(0.35 + weightRatio * 0.5 + (rarityPower[species.rarity] || 0), 0.25, 1.05);

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
    rod.tipX = rod.baseX + Math.floor(W * 0.18);
    rod.tipY = rod.baseY - Math.floor(H * 0.16);

    // keep bobber stable if visible
    if (bobber.visible) {
      bobber.x = clamp(bobber.x, W * 0.34, W * 0.92);
      bobber.y = clamp(bobber.y, scene.lakeY + 16, H - 30);
    }
  }
  window.addEventListener("resize", resize);

  // ===== Persistent state =====
  const STORAGE_KEY = "icefish_v1";
  const STORAGE_VERSION = 2;

  const stats = {
    coins: 0,
    fish: 0,
    bestCoin: 0,
  };

  let inventory = [];
  let inventorySort = "WEIGHT_DESC";

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
      if (btnMute) btnMute.textContent = `Звук: ${muted ? "Выкл" : "Вкл"}`;
    } catch {}
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        storageVersion: STORAGE_VERSION,
        coins: stats.coins,
        fish: stats.fish,
        bestCoin: stats.bestCoin,
        muted,
        inventory
      }));
    } catch {}
  }

  function resetProgress() {
    stats.coins = 0;
    stats.fish = 0;
    stats.bestCoin = 0;
    inventory = [];
    save();
    updateHUD();
    renderInventory();
  }

  btnReset?.addEventListener("click", () => {
    resetProgress();
    setOverlayText("Прогресс сброшен. Нажми «Играть».");
  });

  function updateHUD() {
    if (coinsEl) coinsEl.textContent = String(stats.coins);
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
    openInventory();
  });

  btnInvClose?.addEventListener("click", () => {
    closeInventory();
  });

  invSort?.addEventListener("change", () => {
    inventorySort = invSort.value;
    renderInventory();
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

  function sellItem(itemId) {
    const index = inventory.findIndex((item) => item.id === itemId);
    if (index === -1) return;
    const item = inventory[index];
    if (item.isTrophy) return;
    inventory.splice(index, 1);
    stats.coins += item.sellValue;
    stats.bestCoin = Math.max(stats.bestCoin, item.sellValue);
    updateHUD();
    save();
    renderInventory();
    setMsg(`Продано: ${item.name} за ${item.sellValue} монет.`, 1.4);
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

      if (!item.isTrophy) {
        const btnSell = document.createElement("button");
        btnSell.className = "invBtn";
        btnSell.textContent = "Продать";
        btnSell.addEventListener("click", (event) => {
          event.stopPropagation();
          sellItem(item.id);
        });
        actions.appendChild(btnSell);
      }

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

      if (!item.isTrophy) {
        const btnSellDetail = document.createElement("button");
        btnSellDetail.className = "invBtn";
        btnSellDetail.textContent = "Продать";
        btnSellDetail.addEventListener("click", (event) => {
          event.stopPropagation();
          sellItem(item.id);
        });
        detailActions.appendChild(btnSellDetail);
      }

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

  function addCatch(catchData) {
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
      isTrophy: false,
      canBeTrophy: catchData.weightKg >= 5.0
    };
    inventory.push(item);
    save();
    if (!invOverlay?.classList.contains("hidden")) {
      renderInventory();
    }
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

  // ===== Gameplay state machine =====
  // IDLE -> CASTING -> WAITING -> BITE -> HOOKED -> REELING -> LANDED/ESCAPED
  const game = {
    mode: "INTRO",
    t: 0,
    biteAt: 0,
    biteWindow: 0.95,
    fishPower: 0.0,
    rarity: "обычная",
    reward: 0,
    catch: null,
    // reel mechanics
    progress: 0,
    need: 1.0,
    tension: 0.35,    // 0..1
    tensionVel: 0.0,
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

  function startGame() {
    hideOverlay();
    game.mode = "IDLE";
    game.t = 0;
    bobber.visible = false;
    bobber.inWater = false;
    setSubtitle("Тап — заброс. Поклёвка → свайп вверх. Тапы — выматывать.");
    setHint("Тапни по воде, чтобы забросить.");
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
    game.biteAt = rand(1.2, 4.2);
  }

  function castTo(x, y) {
    game.mode = "CASTING";
    game.t = 0;

    bobber.visible = true;
    bobber.inWater = false;
    bobber.wave = 0;

    bobber.x = rod.baseX + 18;
    bobber.y = rod.baseY - 6;

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
    setMsg("Ждём поклёвку…", 1.1);
  }

  function enterBite() {
    game.mode = "BITE";
    game.t = 0;
    beep(820, 0.08, 0.05);
    setMsg("ПОКЛЁВКА! Свайп вверх (подсечка)!", 1.0);
  }

  function escape(reason = "Сорвалась…") {
    game.mode = "IDLE";
    game.t = 0;
    bobber.visible = false;
    bobber.inWater = false;
    game.catch = null;
    beep(220, 0.10, 0.05);
    setMsg(`${reason} Тап — забросить снова.`, 1.6);
  }

  function hook() {
    if (game.mode !== "BITE") return;

    const catchData = buildCatch();
    game.catch = catchData;
    game.rarity = catchData.rarityLabel;
    game.fishPower = catchData.power;
    game.reward = catchData.sellValue;

    // reel mechanics
    game.progress = 0;
    game.need = clamp(1.0 + game.fishPower * 0.65, 1.05, 1.65);
    game.tension = 0.35 + game.fishPower * 0.10;
    game.tensionVel = 0;

    game.mode = "HOOKED";
    game.t = 0;
    beep(960, 0.06, 0.06);
    setMsg(`Подсечка! Рыба: ${catchData.name} (${catchData.rarityLabel}).`, 1.1);
  }

  function startReel() {
    game.mode = "REELING";
    game.t = 0;
    game.lastTap = 999;
    setMsg("Тапай, чтобы выматывать. Следи за натяжением!", 1.2);
  }

  function land() {
    if (!game.catch) return;

    stats.fish += 1;
    updateHUD();

    addCatch(game.catch);
    save();

    game.mode = "LANDED";
    game.t = 0;
    beep(660, 0.08, 0.06);
    setMsg(
      `Поймал: ${game.catch.name} ${formatKg(game.catch.weightKg)}. Открой инвентарь — продай или сделай трофей.`,
      1.8
    );

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

    // tap actions
    if (game.mode === "IDLE") {
      // cast to tap point (or mid-lake if tap outside)
      const y = clamp(p.y, scene.lakeY - 10, H - 20);
      castTo(p.x, y);
      return;
    }

    if (game.mode === "REELING") {
      // reel tap: increases progress but may also increase tension slightly
      game.lastTap = 0;
      const baseGain = 0.070 - game.fishPower * 0.020;
      const gain = Math.max(0.030, baseGain);
      game.progress += gain;

      // tapping adds a smaller tension bump; higher if tension already high
      const bump = (game.tension > 0.72)
        ? (TAP_TENSION_BUMP_HIGH_BASE + game.fishPower * TAP_TENSION_BUMP_HIGH_POWER)
        : (TAP_TENSION_BUMP_BASE + game.fishPower * TAP_TENSION_BUMP_POWER);
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
    }

    // state transitions
    if (game.mode === "WAITING") {
      if (game.t >= game.biteAt) enterBite();
    }

    if (game.mode === "BITE") {
      if (game.t > game.biteWindow) escape("Не успел подсечь");
    }

    if (game.mode === "HOOKED") {
      if (game.t > 0.25) startReel();
    }

    if (game.mode === "REELING") {
      const pull = (TENSION_PULL_BASE + game.fishPower * TENSION_PULL_POWER) * dt;
      let relax = (TENSION_RELAX_BASE - game.fishPower * TENSION_RELAX_POWER) * dt;

      if (game.lastTap > 0.45) {
        relax *= RELAX_MULT_LATE;
      } else if (game.lastTap > 0.20) {
        relax *= RELAX_MULT_EARLY;
      } else {
        relax *= 0.6;
      }

      game.tension = clamp(game.tension + pull - relax, 0, 1.2);

      // progress decay (fish pulls line out)
      const progDecay = (0.040 + game.fishPower * 0.055) * dt;
      game.progress = Math.max(0, game.progress - progDecay);

      // moving bobber toward shore with progress
      const p = clamp(game.progress / game.need, 0, 1);
      bobber.x = lerp(W * 0.78, W * 0.42, p);
      bobber.y = scene.lakeY + 18 + Math.sin(bobber.wave * 6.0) * 1.6;

      // lose conditions
      if (game.tension >= 1.0) {
        escape("Леска лопнула");
        return;
      }
      if (game.t > (7.2 - game.fishPower * 2.2)) {
        escape("Ушла в глубину");
        return;
      }

      // win condition
      if (game.progress >= game.need) {
        land();
        return;
      }

      // guidance hint based on tension
      if (game.t % 0.5 < dt) {
        if (game.tension > 0.82) setHint("Красная зона — пауза, не тапай!");
        else if (game.tension < 0.25) setHint("Натяжение низкое — можно тапать.");
        else setHint("Держи натяжение в зелёной зоне.");
      }
    }

    if (game.mode === "LANDED") {
      if (game.t > 1.0) {
        game.mode = "IDLE";
        game.t = 0;
        bobber.visible = false;
        bobber.inWater = false;
        setHint("Тапни по воде, чтобы забросить.");
      }
    }
  }

  // ===== Drawing =====
  function draw() {
    // background
    ctx.fillStyle = "#0b1621";
    ctx.fillRect(0, 0, W, H);

    // sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, scene.horizonY);
    skyGrad.addColorStop(0, "#07121b");
    skyGrad.addColorStop(1, "#132b3f");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, scene.horizonY + 2);

    // horizon fog
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = "#cfe7ff";
    ctx.fillRect(0, scene.horizonY - 10, W, 24);
    ctx.globalAlpha = 1;

    // distant treeline
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#061018";
    const hy = scene.horizonY + 10;
    ctx.beginPath();
    ctx.moveTo(0, hy);
    for (let x = 0; x <= W; x += 24) {
      const h = 10 + Math.sin(x * 0.07 + scene.t * 0.4) * 7 + rand(-1, 1);
      ctx.lineTo(x, hy - h);
    }
    ctx.lineTo(W, hy + 80);
    ctx.lineTo(0, hy + 80);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // lake
    ctx.fillStyle = "#071f2e";
    ctx.fillRect(0, scene.lakeY, W, H - scene.lakeY);

    // ripples
    ctx.globalAlpha = 0.14;
    ctx.strokeStyle = "#9ad1ff";
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
      const y = scene.lakeY + 24 + i * 24 + Math.sin(scene.t * 1.1 + i) * 4;
      ctx.beginPath();
      ctx.moveTo(W * 0.08, y);
      ctx.quadraticCurveTo(W * 0.52, y + Math.sin(i) * 6, W * 0.92, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // dock
    ctx.fillStyle = "#162433";
    ctx.fillRect(0, scene.dockY, W, 14);
    ctx.globalAlpha = 0.30;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, scene.dockY + 12, W, 3);
    ctx.globalAlpha = 1;

    // fisherman
    const manX = rod.baseX - 12;
    const manY = rod.baseY - 10;

    // body
    ctx.fillStyle = "#eaf2ff";
    roundRect(manX - 10, manY + 6, 24, 26, 8);
    ctx.fill();

    // head
    ctx.beginPath();
    ctx.arc(manX, manY, 10, 0, Math.PI * 2);
    ctx.fill();

    // scarf
    ctx.strokeStyle = "#7bd3ff";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(manX - 8, manY + 18);
    ctx.lineTo(manX + 10, manY + 18);
    ctx.stroke();

    // rod
    ctx.strokeStyle = "#cda873";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(rod.baseX, rod.baseY);
    ctx.lineTo(rod.tipX, rod.tipY);
    ctx.stroke();

    // line + bobber
    if (bobber.visible) {
      ctx.strokeStyle = "rgba(230,240,255,0.55)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(rod.tipX, rod.tipY);

      const midX = (rod.tipX + bobber.x) * 0.5;
      const midY = (rod.tipY + bobber.y) * 0.5 + 30;
      ctx.quadraticCurveTo(midX, midY, bobber.x, bobber.y);
      ctx.stroke();

      // bobber shadow
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.arc(bobber.x + 3, bobber.y + 3, bobber.r * 0.92, 0, Math.PI * 2);
      ctx.fill();

      // bobber
      ctx.fillStyle = "#ffcc33";
      ctx.beginPath();
      ctx.arc(bobber.x, bobber.y, bobber.r, 0, Math.PI * 2);
      ctx.fill();

      // highlight
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(bobber.x - 3, bobber.y - 3, bobber.r * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // UI meters on canvas
    if (game.mode === "REELING") {
      drawMeters();
    }

    // short center prompt
    drawPrompt();
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
    const gz0 = 0.28, gz1 = 0.72;
    roundRect(x - barW / 2 + 2 + (barW - 4) * gz0, ty - barH / 2 + 2, (barW - 4) * (gz1 - gz0), barH - 4, 8);
    ctx.fill();

    // tension fill with color
    ctx.globalAlpha = 0.92;
    const color =
      (t < 0.25) ? "#ffd166" :
      (t > 0.82) ? "#ff6b6b" :
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

  // ===== Boot =====
  load();
  updateHUD();
  resize();
  renderInventory();

  // intro overlay
  showOverlay();
  setOverlayText("Тапни «Играть». Управление: тап — заброс, поклёвка → свайп вверх, затем тапами выматывай.");
  setHint("Нажми «Играть».");
  registerSW();

  requestAnimationFrame(loop);
})();
