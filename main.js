// main.js
// Обёртка под iPhone / мобилку: канвас на весь экран, адаптация под DPR, тач-управление и PWA

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d', { alpha: false });

const resourceGoldEl = document.getElementById('resource-gold');
const resourceWoodEl = document.getElementById('resource-wood');

let lastTime = 0;
let isPointerDown = false;
let pointerId = null;
let pointerStart = { x: 0, y: 0 };
let pointerCurrent = { x: 0, y: 0 };

// Игровое состояние — здесь ты подключаешь свою логику карты, героя, деревьев и т.д.
const game = {
    width: 0,
    height: 0,
    resources: {
        gold: 0,
        wood: 0
    },
    camera: {
        x: 0,
        y: 0,
        zoom: 1
    },

    init() {
        // TODO: сюда перенеси инициализацию своей прототипной игры:
        // - генерация карты
        // - создание героя
        // - расстановка деревьев/камней
    },

    resize(w, h) {
        this.width = w;
        this.height = h;
        // При желании можешь зафиксировать минимальный/максимальный зум или границы камеры
    },

    handleTap(worldX, worldY) {
        // Одиночный тап — например, выделение клетки, перемещение героя, выбор объекта
        // TODO: сюда перенеси обработку клика из своей игры
        console.log('Tap at world:', worldX, worldY);
    },

    handleDragStart(worldX, worldY) {
        // Начало свайпа — можно, например, запомнить старт для перетаскивания камеры
        this._dragStartCamera = { x: this.camera.x, y: this.camera.y };
        this._dragStartWorld = { x: worldX, y: worldY };
    },

    handleDragMove(worldX, worldY) {
        // Перетаскиваем камеру по карте (пример реализации)
        if (!this._dragStartCamera || !this._dragStartWorld) return;

        const dx = worldX - this._dragStartWorld.x;
        const dy = worldY - this._dragStartWorld.y;

        // Камера двигается в противоположную сторону от свайпа
        this.camera.x = this._dragStartCamera.x - dx;
        this.camera.y = this._dragStartCamera.y - dy;
    },

    handleDragEnd() {
        this._dragStartCamera = null;
        this._dragStartWorld = null;
    },

    handlePinch(zoomDelta) {
        // Прищипывание двумя пальцами — изменение зума
        // Ограничиваем диапазон, чтобы не улетать в космос
        const minZoom = 0.5;
        const maxZoom = 3.0;
        this.camera.zoom = Math.min(maxZoom, Math.max(minZoom, this.camera.zoom * zoomDelta));
    },

    update(dt) {
        // Тут твоя игровая логика:
        // - движение юнитов
        // - атака/AI
        // - добыча ресурсов
        // - таймеры, эффекты и т.п.

        // Для примера просто накапливаем золото
        this.resources.gold += dt * 1; // 1 золото в секунду
        resourceGoldEl.textContent = 'Золото: ' + this.resources.gold.toFixed(0);
        resourceWoodEl.textContent = 'Дерево: ' + this.resources.wood.toFixed(0);
    },

    render(ctx) {
        // Очищаем экран логически (фактически clearRect делаем в цикле)
        // Задаём фон
        ctx.fillStyle = '#1d2733';
        ctx.fillRect(0, 0, this.width, this.height);

        // Сохраняем состояние и применяем камеру
        ctx.save();
        ctx.translate(this.width / 2, this.height / 2);
        ctx.scale(this.camera.zoom, this.camera.zoom);
        ctx.translate(-this.camera.x, -this.camera.y);

        // TODO: здесь твоя отрисовка:
        // - земля/тайлы
        // - деревья, камни
        // - здания
        // - юниты/герой

        // ВРЕМЕННО: рисуем тестовую сетку и "героя"
        const tileSize = 64;
        const halfTiles = 5;

        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        for (let x = -halfTiles; x <= halfTiles; x++) {
            for (let y = -halfTiles; y <= halfTiles; y++) {
                const sx = x * tileSize;
                const sy = y * tileSize;
                ctx.strokeRect(sx, sy, tileSize, tileSize);
            }
        }

        // "Герой" в центре
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
};

// Масштабирование канваса под экран и DPR
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Физический размер канваса в пикселях
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Логический размер — в CSS-пикселях
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    game.resize(rect.width, rect.height);
}

// Конвертация координат экрана в мировые (с учётом камеры и зума)
function screenToWorld(x, y) {
    const w = game.width;
    const h = game.height;

    // Переводим в координаты относительно центра
    const cx = x - w / 2;
    const cy = y - h / 2;

    const worldX = cx / game.camera.zoom + game.camera.x;
    const worldY = cy / game.camera.zoom + game.camera.y;

    return { x: worldX, y: worldY };
}

// Обработка pointer-событий (тап/свайп/drag)
function onPointerDown(e) {
    // Только один активный указатель (игнорируем остальные)
    if (isPointerDown && pointerId !== e.pointerId) return;

    isPointerDown = true;
    pointerId = e.pointerId;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    pointerStart.x = x;
    pointerStart.y = y;
    pointerCurrent.x = x;
    pointerCurrent.y = y;

    const world = screenToWorld(x, y);
    game.handleDragStart(world.x, world.y);

    // Запрещаем контекстное меню и зум по двойному тапу
    e.preventDefault();
}

function onPointerMove(e) {
    if (!isPointerDown || pointerId !== e.pointerId) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    pointerCurrent.x = x;
    pointerCurrent.y = y;

    const world = screenToWorld(x, y);
    game.handleDragMove(world.x, world.y);

    e.preventDefault();
}

function onPointerUp(e) {
    if (!isPointerDown || pointerId !== e.pointerId) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - pointerStart.x;
    const dy = y - pointerStart.y;
    const distance = Math.hypot(dx, dy);

    const world = screenToWorld(x, y);

    // Если палец почти не двигался — считаем, что это тап
    if (distance < 10) {
        game.handleTap(world.x, world.y);
    }

    game.handleDragEnd();

    isPointerDown = false;
    pointerId = null;

    e.preventDefault();
}

function preventContextMenu(e) {
    e.preventDefault();
}

// Простейшая обработка жеста pinch (двумя пальцами)
// Используем touch-события, т.к. pointer pinch сложнее отличить кроссбраузерно
let lastPinchDistance = null;

function onTouchStart(e) {
    if (e.touches.length === 2) {
        const d = touchDistance(e.touches[0], e.touches[1]);
        lastPinchDistance = d;
    }
}

function onTouchMove(e) {
    if (e.touches.length === 2 && lastPinchDistance !== null) {
        const d = touchDistance(e.touches[0], e.touches[1]);
        const delta = d / lastPinchDistance;

        if (!isNaN(delta) && isFinite(delta) && delta !== 1) {
            game.handlePinch(delta);
            lastPinchDistance = d;
        }

        e.preventDefault();
    }
}

function onTouchEnd(e) {
    if (e.touches.length < 2) {
        lastPinchDistance = null;
    }
}

function touchDistance(t1, t2) {
    const dx = t2.clientX - t1.clientX;
    const dy = t2.clientY - t1.clientY;
    return Math.hypot(dx, dy);
}

// Игровой цикл
function loop(timestamp) {
    const dt = (timestamp - lastTime) / 1000 || 0;
    lastTime = timestamp;

    game.update(dt);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.render(ctx);

    requestAnimationFrame(loop);
}

// Регистрация service worker для PWA (если поддерживается)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(err => {
            console.warn('SW registration failed', err);
        });
    });
}

// Инициализация
function init() {
    game.init();
    resizeCanvas();
    requestAnimationFrame(loop);
}

// Слушатели событий
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => {
    // Небольшая задержка, чтобы iOS успел пересчитать layout
    setTimeout(resizeCanvas, 300);
});

canvas.addEventListener('pointerdown', onPointerDown);
canvas.addEventListener('pointermove', onPointerMove);
canvas.addEventListener('pointerup', onPointerUp);
canvas.addEventListener('pointercancel', onPointerUp);
canvas.addEventListener('contextmenu', preventContextMenu);

// Touch-события для pinch-зума
canvas.addEventListener('touchstart', onTouchStart, { passive: false });
canvas.addEventListener('touchmove', onTouchMove, { passive: false });
canvas.addEventListener('touchend', onTouchEnd);
canvas.addEventListener('touchcancel', onTouchEnd);

// Старт
window.addEventListener('load', init);
