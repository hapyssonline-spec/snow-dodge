// main.js — мини-игра "Рыбалка" (iPhone/Safari friendly)

(() => {
  "use strict";

  // ===== DOM =====
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d", { alpha: false });

  const goldEl = document.getElementById("resource-gold"); // слева
  const woodEl = document.getElementById("resource-wood"); // справа (переиспользуем под "Рыба")

  // ===== Utils =====
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);

  // ===== Viewport / DPI =====
  let W = 0, H = 0, DPR = 1;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    DPR = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
    W = Math.max(1, Math.floor(rect.width));
    H = Math.max(1, Math.floor(rect.height));

    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // при ресайзе держим ключевые элементы в адекватных местах
    lake.y = Math.floor(H * 0.58);
    dock.y = lake.y - 10;
    rod.baseX = Math.floor(W * 0.25);
    rod.baseY = dock.y - 20;
  }

  window.addEventListener("resize", resize);

  // ===== Game Data =====
  const ui = {
    coins: 0,
    fish: 0,
    best: 0,
  };

  function updateHUD() {
    // Переиспользуем твои спаны: "Золото" -> "Монеты", "Дерево" -> "Рыба"
    if (goldEl) goldEl.textContent = `Монеты: ${ui.coins}`;
    if (woodEl) woodEl.textContent = `Рыба: ${ui.fish}`;
  }

  const lake = { y: 0 };
  const dock = { y: 0 };

  const rod = {
    baseX: 0,
    baseY: 0,
    tipX: 0,
    tipY: 0,
  };

  // Bobber / line
  const bobber = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    r: 10,
    inWater: false,
    visible: false,
    waveT: 0,
  };

  // Fishing states
  // IDLE -> CASTING -> WAITING -> BITE -> HOOKED -> REELING -> LANDED (then back to IDLE)
  const state = {
    mode: "IDLE",
    t: 0,
    biteAt: 0,
    biteWindow: 0.85,     // сек на подсечку
    hooked: false,
    fishPower: 0,         // "сила" рыбы
    reel: 0,              // прогресс выматывания 0..1
    reelNeed: 0.0,        // сколько нужно "накрутить"
    reelDecay: 0.0,       // сопротивление (сбрасывает прогресс)
    reward: 0,            // монеты за рыбу
    rarity: "обычная",
    message: "Тапни, чтобы забросить.",
    messageT: 0,
    lastTapT: 0,
  };

  function setMessage(text, seconds = 1.4) {
    state.message = text;
    state.messageT = seconds;
  }

  // ===== Input =====
  let pointerDown = false;
  let pointerId = null;
  let startX = 0, startY = 0;
  let lastX = 0, lastY = 0;
  let swipeConsumed = false;

  function getXY(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left),
      y: (e.clientY - rect.top),
    };
  }

  function onPointerDown(e) {
    // iOS needs preventDefault to avoid scroll
    e.preventDefault();

    pointerDown = true;
    pointerId = e.pointerId ?? null;
    const p = getXY(e);
    startX = lastX = p.x;
    startY = lastY = p.y;
    swipeConsumed = false;

    // Tap behavior depends on mode
    if (state.mode === "IDLE") {
      startCast(p.x, p.y);
      return;
    }

    if (state.mode === "REELING") {
      // Тапы увеличивают прогресс — основной "геймплей"
      tapReel();
      return;
    }

    // В остальных режимах тап — просто игнор/подсказка
  }

  function onPointerMove(e) {
    if (!pointerDown) return;
    e.preventDefault();

    const p = getXY(e);
    lastX = p.x;
    lastY = p.y;

    // Swipes only matter during BITE
    if (state.mode === "BITE" && !swipeConsumed) {
      const dy = p.y - startY;
      const dx = p.x - startX;

      // Свайп вверх: dy < -40, и по оси Y доминирует
      if (dy < -42 && Math.abs(dy) > Math.abs(dx) * 1.2) {
        swipeConsumed = true;
        tryHook();
      }
    }
  }

  function onPointerUp(e) {
    e.preventDefault();
    pointerDown = false;
    pointerId = null;
  }

  canvas.style.touchAction = "none";
  canvas.addEventListener("pointerdown", onPointerDown, { passive: false });
  canvas.addEventListener("pointermove", onPointerMove, { passive: false });
  canvas.addEventListener("pointerup", onPointerUp, { passive: false });
  canvas.addEventListener("pointercancel", onPointerUp, { passive: false });

  // ===== Gameplay =====
  function startCast(px, py) {
    // Заброс: всегда "в озеро" (правее центра)
    state.mode = "CASTING";
    state.t = 0;
    state.hooked = false;
    state.reel = 0;
    state.reelNeed = 0;
    state.reward = 0;

    bobber.visible = true;
    bobber.inWater = false;
    bobber.waveT = 0;

    // старт у удочки
    bobber.x = rod.baseX + 20;
    bobber.y = rod.baseY - 6;

    // цель — точка на воде
    const tx = clamp(px, W * 0.40, W * 0.92);
    const ty = lake.y + 18;

    // "парабола" простая: задаём скорость так, чтобы долетело
    const flight = 0.55;
    bobber.vx = (tx - bobber.x) / flight;
    bobber.vy = (ty - bobber.y) / flight - 220; // вверх

    setMessage("Заброс!", 0.8);
  }

  function scheduleBite() {
    // поклёвка через 1.2..3.8 сек
    state.biteAt = rand(1.2, 3.8);
  }

  function rollFish() {
    // простая "редкость"
    const r = Math.random();
    if (r < 0.08) return { rarity: "редкая", power: rand(0.70, 1.0), reward: Math.floor(rand(18, 30)) };
    if (r < 0.28) return { rarity: "необычная", power: rand(0.45, 0.75), reward: Math.floor(rand(10, 17)) };
    return { rarity: "обычная", power: rand(0.25, 0.50), reward: Math.floor(rand(5, 9)) };
  }

  function startWaiting() {
    state.mode = "WAITING";
    state.t = 0;
    scheduleBite();
    setMessage("Ждём поклёвку...", 1.2);
  }

  function startBite() {
    state.mode = "BITE";
    state.t = 0;
    setMessage("ПОКЛЁВКА! Свайп вверх для подсечки!", 1.0);
  }

  function tryHook() {
    if (state.mode !== "BITE") return;
    // шанс успешной подсечки: если успел в окно — 100%, иначе уже истёк
    const fish = rollFish();
    state.rarity = fish.rarity;
    state.fishPower = fish.power;
    state.reward = fish.reward;

    state.mode = "HOOKED";
    state.t = 0;

    // параметры выматывания
    state.reel = 0;
    state.reelNeed = clamp(0.95 + state.fishPower * 0.65, 1.0, 1.55); // нужно "намотать" больше для сильной
    state.reelDecay = 0.10 + state.fishPower * 0.22;

    setMessage(`Подсечка! Рыба: ${state.rarity}. Тапай быстро, чтобы вытащить!`, 1.4);
  }

  function escape() {
    // срыв
    state.mode = "IDLE";
    state.t = 0;
    bobber.visible = false;
    bobber.inWater = false;
    setMessage("Сорвалась… Тапни, чтобы забросить снова.", 1.6);
  }

  function landFish() {
    ui.fish += 1;
    ui.coins += state.reward;
    ui.best = Math.max(ui.best, state.reward);

    updateHUD();

    state.mode = "LANDED";
    state.t = 0;

    setMessage(`Поймал! +${state.reward} монет (${state.rarity}).`, 1.6);
  }

  function tapReel() {
    if (state.mode !== "REELING") return;
    // тап прибавляет прогресс, но сильная рыба требует больше тапов
    const gain = 0.065 - state.fishPower * 0.020; // сильнее — меньше прирост
    state.reel += Math.max(0.028, gain);
    state.lastTapT = 0;
  }

  // ===== Update / Physics =====
  let lastTime = 0;

  function update(dt) {
    state.t += dt;
    if (state.messageT > 0) state.messageT -= dt;

    // линия и кончик удочки к поплавку
    rod.tipX = rod.baseX + 70;
    rod.tipY = rod.baseY - 60;

    // обновление поплавка
    if (bobber.visible) {
      if (state.mode === "CASTING") {
        // простая баллистика
        bobber.x += bobber.vx * dt;
        bobber.y += bobber.vy * dt;
        bobber.vy += 620 * dt; // гравитация

        // вход в воду
        if (bobber.y >= lake.y + 18) {
          bobber.y = lake.y + 18;
          bobber.vx *= 0.12;
          bobber.vy = 0;
          bobber.inWater = true;

          // переключаемся в ожидание
          startWaiting();
        }
      } else if (bobber.inWater) {
        // плавает
        bobber.waveT += dt * (1.4 + state.fishPower * 0.6);
        const amp = (state.mode === "BITE") ? 4.0 : 1.4;
        bobber.y = lake.y + 18 + Math.sin(bobber.waveT * 6.0) * amp;
        // легкий дрейф
        bobber.x += Math.sin(bobber.waveT * 1.2) * 0.25;
      }
    }

    // логика состояний
    if (state.mode === "WAITING") {
      if (state.t >= state.biteAt) startBite();
    }

    if (state.mode === "BITE") {
      // окно подсечки
      if (state.t > state.biteWindow) {
        escape();
      } else {
        // визуальная тряска поплавка
        bobber.waveT += dt * 2.5;
      }
    }

    if (state.mode === "HOOKED") {
      // короткая пауза, затем выматывание
      if (state.t > 0.25) {
        state.mode = "REELING";
        state.t = 0;
      }
    }

    if (state.mode === "REELING") {
      // сопротивление: если не тапать — прогресс уменьшается
      state.lastTapT += dt;

      const decay = state.reelDecay * dt * (1.0 + Math.min(1.5, state.lastTapT * 1.2));
      state.reel = Math.max(0, state.reel - decay);

      // чтобы не было “вечной” рыбы: общий таймер
      const timeLimit = 6.5 - state.fishPower * 2.2; // сильная — меньше времени
      if (state.t > timeLimit) {
        escape();
        return;
      }

      // победа
      if (state.reel >= state.reelNeed) {
        landFish();
        return;
      }

      // при выматывании поплавок слегка смещается к берегу
      const pull = (state.reel / state.reelNeed);
      bobber.x = clamp(W * 0.70 - pull * (W * 0.40), W * 0.33, W * 0.90);
      bobber.y = lake.y + 18 + Math.sin(bobber.waveT * 6.0) * 1.2;
      bobber.waveT += dt;
    }

    if (state.mode === "LANDED") {
      if (state.t > 1.0) {
        // назад в idle
        state.mode = "IDLE";
        state.t = 0;
        bobber.visible = false;
        bobber.inWater = false;
        setMessage("Тапни, чтобы забросить.", 2.0);
      }
    }

    if (state.mode === "IDLE") {
      // ничего
    }
  }

  // ===== Drawing =====
  function draw() {
    // фон
    ctx.fillStyle = "#0f1a24";
    ctx.fillRect(0, 0, W, H);

    // небо
    const skyH = lake.y;
    const grad = ctx.createLinearGradient(0, 0, 0, skyH);
    grad.addColorStop(0, "#0b1621");
    grad.addColorStop(1, "#13283a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, skyH);

    // дальний лес (силуэты)
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#081018";
    const horizonY = lake.y - 18;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    for (let x = 0; x <= W; x += 22) {
      const h = 10 + Math.sin(x * 0.06) * 8 + rand(-2, 2);
      ctx.lineTo(x, horizonY - h);
    }
    ctx.lineTo(W, horizonY + 80);
    ctx.lineTo(0, horizonY + 80);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // вода
    ctx.fillStyle = "#0b2233";
    ctx.fillRect(0, lake.y, W, H - lake.y);

    // рябь
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = "#9ad1ff";
    ctx.lineWidth = 1;
    for (let i = 0; i < 9; i++) {
      const y = lake.y + 22 + i * 26 + Math.sin((performance.now() / 900) + i) * 4;
      ctx.beginPath();
      ctx.moveTo(W * 0.08, y);
      ctx.quadraticCurveTo(W * 0.52, y + Math.sin(i) * 6, W * 0.92, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // пирс/берег
    ctx.fillStyle = "#1a2b3b";
    ctx.fillRect(0, dock.y, W, 14);
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, dock.y + 12, W, 3);
    ctx.globalAlpha = 1;

    // персонаж (очень просто)
    const manX = rod.baseX - 12;
    const manY = rod.baseY - 12;
    ctx.fillStyle = "#dfe9f7";
    ctx.beginPath();
    ctx.arc(manX, manY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#dfe9f7";
    ctx.fillRect(manX - 10, manY + 8, 22, 22);

    // удочка
    ctx.strokeStyle = "#cfa972";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(rod.baseX, rod.baseY);
    ctx.lineTo(rod.tipX, rod.tipY);
    ctx.stroke();

    // леска + поплавок
    if (bobber.visible) {
      ctx.strokeStyle = "rgba(230,240,255,0.55)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(rod.tipX, rod.tipY);
      // небольшая дуга
      const midX = (rod.tipX + bobber.x) * 0.5;
      const midY = (rod.tipY + bobber.y) * 0.5 + 30;
      ctx.quadraticCurveTo(midX, midY, bobber.x, bobber.y);
      ctx.stroke();

      // поплавок
      ctx.fillStyle = "#ffcc33";
      ctx.beginPath();
      ctx.arc(bobber.x, bobber.y, bobber.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.arc(bobber.x + 3, bobber.y + 3, bobber.r * 0.85, 0, Math.PI * 2);
      ctx.fill();
    }

    // UI подсказки поверх канваса
    drawCenterUI();
  }

  function drawCenterUI() {
    // центральные подсказки
    const text = state.messageT > 0 ? state.message : (
      state.mode === "IDLE" ? "Тапни, чтобы забросить." :
      state.mode === "WAITING" ? "Ждём поклёвку..." :
      state.mode === "BITE" ? "ПОКЛЁВКА! Свайп вверх!" :
      state.mode === "REELING" ? "Тапай, чтобы вытащить!" :
      ""
    );

    if (text) {
      ctx.save();
      ctx.font = "600 16px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const padX = 14;
      const padY = 10;
      const x = W * 0.5;
      const y = lake.y - 70;

      const m = ctx.measureText(text);
      const w = Math.min(W - 24, m.width + padX * 2);
      const h = 36;

      ctx.globalAlpha = 0.75;
      ctx.fillStyle = "#0b0f14";
      roundRect(x - w / 2, y - h / 2, w, h, 12);
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.fillStyle = "#eaf2ff";
      ctx.fillText(text, x, y);
      ctx.restore();
    }

    // прогресс выматывания
    if (state.mode === "REELING") {
      const x = W * 0.5;
      const y = lake.y - 28;
      const barW = Math.min(340, W * 0.78);
      const barH = 14;
      const p = clamp(state.reel / state.reelNeed, 0, 1);

      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = "#0b0f14";
      roundRect(x - barW / 2, y - barH / 2, barW, barH, 10);
      ctx.fill();

      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "#7bd3ff";
      roundRect(x - barW / 2 + 2, y - barH / 2 + 2, (barW - 4) * p, barH - 4, 8);
      ctx.fill();

      ctx.globalAlpha = 1;
      ctx.fillStyle = "#dfe9f7";
      ctx.font = "600 12px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(`Рыба: ${state.rarity} • Награда: ${state.reward}`, x, y - 12);
      ctx.restore();
    }
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

  // ===== Loop =====
  function loop(t) {
    if (!lastTime) lastTime = t;
    const dt = Math.min(0.033, (t - lastTime) / 1000);
    lastTime = t;

    update(dt);
    draw();

    requestAnimationFrame(loop);
  }

  // ===== Boot =====
  // начальные позиции
  lake.y = 0;
  dock.y = 0;
  rod.baseX = 0;
  rod.baseY = 0;

  resize();

  // стартовые значения
  updateHUD();
  setMessage("Тапни, чтобы забросить.", 2.0);

  requestAnimationFrame(loop);
})();
