ICE FISH — Lake Scene Pack v1 (PNG)

Файлы:
- bg_lake_portrait.png   (портрет, 1024x1792) — фон сцены "озеро" для телефона
- bg_lake_landscape.png  (ландшафт, 1792x1024) — не используется (оставлен в репозитории)
- hero.png               — герой (PNG с прозрачностью)
- rod.png                — удочка (PNG с прозрачностью), вращать через CSS transform
- bobber.png             — поплавок (PNG с прозрачностью)

Подключение (пример CSS):
#lakeScene { background: url('bg_lake_portrait.png') center/cover no-repeat; }

Слои:
- hero/rod/bobber кладёшь абсолютными слоями внутри #lakeScene.

---

## Stage architecture (performance)

В проект добавлен каркас stage/scene-архитектуры:
- `stage/StageBase.js` — базовый класс stage с трекингом ресурсов (`timers`, `intervals`, `listeners`, `aborters`, `raf`).
- `stage/StageManager.js` — менеджер переключений (`register`, `go`, `goWithTransition`).

### Как добавить новый stage
1. Создай класс, наследующий `StageBase`.
2. Переопредели минимум `enter(params)` и `exit()`.
3. Все `addEventListener` делай через `this.on(...)`.
4. Все таймеры делай через `this.setTimeout(...)` / `this.setInterval(...)`.
5. Любые загрузки запускай через `const c = this.createAbortController(); fetch(url, { signal: c.signal })`.
6. При `exit()` вызывается полная очистка (listeners/timers/raf/abort).

### Переходы
- Прямой переход: `stageManager.go("shop", { sceneId })`.
- Через переходный stage: `stageManager.goWithTransition("world", "travel", "world", { sceneId: "..." })`.

### Текущая миграция
- `world` stage — игровой мир/основной цикл.
- `shop` stage — магазин/трофейная/лавка.
- `tutorial` stage — обучение с блокировкой остального UI.
- `travel` stage — лёгкий экран пути.
