# Спека: Ежемесячный чемпионат «Лучший рыболов»

## 0) Данные, которые нужны для финальной калибровки (коротко, но полно)

1. Распределения веса рыбы по редкостям C/U/R/E/L: min/avg/p95/max.
2. Фактические шансы выпадения по редкостям C/U/R/E/L (с учетом удочек/локаций/бустеров).
3. Среднее число уловов: за сессию, в день, в месяц (p50/p90 для активных игроков).
4. Наличие лимитов: энергия, суточные лимиты, билеты, бустеры, премиум.
5. Влияют ли локации/время суток/погода на редкость и вес (и на сколько, в %).
6. Есть ли мини-игра качества (Perfect/Good/Fail), серии, «без ошибок».
7. Прогрессия снастей: уровни, статы, % к редкости/весу/частоте клева.
8. Экономика: желаемые месячные выплаты монет/гемов по топ-диапазонам.
9. ARPPU/монетизация ограничения: допустимо ли выдавать гемы в топ-500 и в каком объеме.
10. Анти-чит: доступные серверные сигналы (timestamp, seed, device, ip, session).
11. Социальная часть: есть ли друзья/кланы/региональные таблицы.
12. Правила санкций: градации фрода и SLA на апелляции.

> Ниже приведен полный проект **в предположении**, что типичные значения близки к F2P-симулятору рыбалки с Legendary ~0.05%.

---

## 1) Турнирные очки (ТО)

### 1.1 Цели системы ТО
- Редкая рыба дает заметно больше очков.
- Один lucky-drop Legendary **не должен гарантировать топ**.
- Скилл игрока (качество подсечки, серии) влияет, но не ломает баланс.
- Прогресс «вкусный»: за активную игру очки растут стабильно.

### 1.2 Базовые коэффициенты

#### Коэффициенты редкости `K_r` (рекомендация v1)
- Common (C): `1.0`
- Uncommon (U): `1.6`
- Rare (R): `2.8`
- Epic (E): `5.0`
- Legendary (L): `9.0`

#### Масштаб очков `S`
- Рекомендуемый диапазон: `S = 40..80`.
- Старт для баланса: `S = 60`.

#### Нормализация веса
`Wn = clamp(weightKg / AvgWeightBySpecies, 0.6, 1.8)`

Идея: тяжелая рыба по виду/семейству награждается, но экстремумы «зажаты», чтобы не было взрывов очков.

### 1.3 Варианты формулы ТО

#### A) Простая (MVP)
`TO = round(S * K_r * Wn)`

- Прозрачно для игрока.
- Быстро калибруется.
- Минус: меньше глубины по скиллу.

#### B) Балансная (рекомендуется)
`TO = round(S * K_r * Wn^0.85 * Q * Streak * AntiAbuse)`

Где:
- `Q` (качество): Fail `0`, Good `1.0`, Perfect `1.12`.
- `Streak`: `1 + min(streakNoFail, 20) * 0.01` (до +20%).
- `AntiAbuse`: мультипликатор `0.55..1.0` (см. предохранители).

Плюс: награждает скилл и стабильность, не превращая в реакционный шутер.

#### C) Хардкорная (для позднего сезона/Pro-лиги)
`TO = round(S * K_r^1.05 * ln(1 + 1.7*Wn) * Q * ComboWindow * AntiAbuse)`

- `ComboWindow`: +2–8% за выполнение «чистой» серии в окне 3–5 минут.
- Меньше линейности, выше потолок мастерства.
- Требует более сильной телеметрии и анти-чита.

### 1.4 Предохранители (anti-abuse)

1. **Diminishing returns на вид рыбы в сутки**
   - Для каждого `speciesId` в день:
     - 1–20 улов: `x1.00`
     - 21–40: `x0.80`
     - 41–80: `x0.60`
     - 81+: `x0.45`

2. **Суточный soft-cap ТО**
   - До `DailySoftCap` (например 12 000 ТО): `x1.00`
   - Следующие 6 000 ТО: `x0.50`
   - Дальше: `x0.20`

3. **Лимит вклада Legendary+ в сезон**
   - В рейтинг учитывается до `L_cap_points` (например 18% от ожидаемого топ-1 месячного ТО).
   - Сверх лимита Legendary still counts, но с `x0.25`.

4. **Убывающая ценность редких уловов в сезоне**
   - Для Epic+ счетчик по игроку:
   `RareDR = 1 / (1 + 0.06 * max(0, epicPlusCountSeason - threshold))`
   - Порог `threshold` = 25 (пример).

5. **Микс-контроль (разнообразие)**
   - Если >70% ТО за 24ч из 1 вида/1 локации, включается глобальный `x0.9` до восстановления разнообразия.

### 1.5 Как честно выбрать K для Legendary при 1/2000

Принцип: Legendary должна быть «вау», но не «авто-топ».

Пусть:
- `pL = 0.0005` (1/2000),
- `N` = уловов/месяц у активного игрока (например 4 000),
- ожидаемое Legendary: `E[L] = N * pL = 2`.

Требование честности:
- Вклад **одной** Legendary не более `1.5–3%` месячного ТО активного игрока.
- Вклад **всех ожидаемых Legendary** `~8–15%` месячного ТО.

Практически:
1. Посчитать базовый месячный ТО без L (`TO_base_month`).
2. Выбрать целевой вклад L: `shareL_target = 0.10`.
3. Решить: `K_L ≈ (shareL_target * TO_base_month) / (E[L] * S * E[Wn_L])`.
4. Ограничить `K_L` коридором `7..11` и включить L-cap.

Для старта (при S=60 и реалистичных весах) `K_L=9` обычно дает «приятно и честно».

---

## 2) Лидерборд

### 2.1 Модель обновления
- **Онлайн-агрегация** после каждого подтвержденного сервером улова.
- Данные рейтинга хранить в Redis Sorted Set (season scope), периодически снапшотить в БД.
- UI:
  - Топ-100 (быстро из Redis).
  - «Мое место» + ±5 соседей (rank window).
  - Вкладка «друзья» (фильтр по friendIds).

### 2.2 Прогресс до следующего диапазона
- Показывать:
  - текущий диапазон,
  - порог следующего диапазона (по месту и/или по ТО),
  - «нужно X ТО до топ-50».
- Для плавающих порогов считать `TO_of_rank(50/10/5/3/1)` realtime.

### 2.3 Тайбрейки (при равных ТО)
1. Больше подтвержденных уловов Rare+.
2. Больше уникальных species в сезоне.
3. Более раннее достижение итогового ТО (firstReachedAt).
4. Если все равно равно — стабильный hash(playerId) для детерминизма.

### 2.4 Таймзона сезона
- Таймзона: `Europe/London`.
- Сезон: `[00:00:00 первого числа, 00:00:00 следующего месяца)` по London time.
- Close job в `00:00:10` (grace 10 сек на очереди).

### 2.5 Баны и анти-чит в таблице
- `visibilityMode`:
  - `public` — обычный.
  - `shadow` — игрок видит «свою» таблицу, но из публичной исключен.
  - `excluded` — исключен из сезона.
- На UI можно показать «под проверкой», если нужно мягко.

---

## 3) Награды

### 3.1 Таблица наград по местам (пример v1)

| Места | Медаль месяца | Монеты | Гемы | Предметы |
|---|---|---:|---:|---|
| 1 | **Aurora Crown Medal** (золотая корона + северное сияние) | 1 000 000 | 2500 | 1x Mythic Season Chest, уникальная рамка профиля, титул `Легенда озера`, след поплавка VFX |
| 2 | **Aurora Grand Medal** (платина + волны) | 700 000 | 1700 | 1x Mythic Season Chest, рамка профиля, титул `Властелин улова` |
| 3 | **Aurora Elite Medal** (золото/платина) | 500 000 | 1200 | 1x Legendary Chest, рамка профиля, титул `Мастер глубин` |
| 4–5 | **Aurora Master Medal** | 350 000 | 800 | 1x Legendary Chest, эпический скин удочки |
| 6–10 | **Aurora Pro Medal** | 220 000 | 500 | 1x Epic Chest, редкий аватар + бейдж |
| 11–50 | **Aurora Challenger Medal** | 120 000 | 220 | 1x Epic Chest, 2x Rare resource pack |
| 51–100 | **Aurora Hunter Medal** | 70 000 | 120 | 1x Rare Chest, 1x Rare resource pack |
| 101–500 | **Aurora Participant Medal** | 30 000 | 40 | 1x Season crate (гарант cosmetic shard) |

### 3.2 Уникальные предметы сезона (не ломающие баланс)
- Косметика: скины удочки/лодки/поплавка, ауры, следы лески.
- Профиль: рамки, титулы, анимированные бейджи.
- Эмоуты/стикеры рыбака.
- **Если бонусы**: только микро-утилити (например +1% XP рыбалки вне PvP/рейтинга), не влияющие на шанс редкости/ТО.

### 3.3 «Приятные награды» для топ-500
- Гарантированный shard сезонной косметики.
- Небольшой пакет гемов (чтобы участие ощущалось значимым).
- Медаль с номером сезона (коллекционная ценность).

### 3.4 Сезонная ротация наград
- Тема месяца (например: Night Lake, Storm, Sakura).
- Пулы:
  - Core pool (стабильные валюты),
  - Cosmetic seasonal pool,
  - Jackpot cosmetic (top-10).
- Ротация 3-месячными циклами, чтобы избежать FOMO-перегрева.

---

## 4) Контент и удержание

### 4.1 Ежедневные турнирные задания (дают ТО)
- «Поймай 15 рыб Good+» → +450 ТО.
- «Поймай 3 Rare+» → +600 ТО.
- «Сделай серию 10 без fail» → +500 ТО.
- «Поймай рыбу в 2 разных локациях» → +350 ТО.

Ограничение: суммарно от дейли не более 8–12% дневного ТО активного игрока.

### 4.2 Недельные задания
- «Набери 12 000 ТО за неделю».
- «Поймай 40 рыб весом >1.2x среднего по виду».
- «Собери 25 unique species».

Недельные дают «догоняющий» эффект, но не перебивают core loop ловли.

### 4.3 Мини-ивенты сезона
- Пример: «Неделя ночной рыбалки».
  - С 20:00–23:00 London: `+10% ТО` только за Uncommon/Rare.
  - Epic+ без бафа (чтобы не разгонять RNG-перекос).
- Пример: «Фестиваль видов» — бонус за разнообразие (до +8%).

---

## 5) Анти-абуз и анти-чит

### 5.1 Что считать только на сервере
- RNG редкости и веса.
- Итоговый расчет ТО.
- Счетчики DR/soft-cap/legendary-cap.
- Обновление лидерборда и выдача наград.

### 5.2 Проверки и флаги
1. **Аномальная частота Rare/Epic/Legendary** (z-score по популяции и по игроку).
2. **Скорость уловов** (невозможные интервалы для текущей снасти/локации).
3. **Невозможные веса** для вида/локации/удочки.
4. **Сессии 24/7 без биометрии поведения** (бот-паттерны).
5. **Clock tampering / replay** (nonce + server timestamp).
6. **Device/IP graph** (фермы аккаунтов, reward laundering).

### 5.3 Лог улова (минимальный набор)
- `catchId`, `playerId`, `seasonId`, `tsServer`, `tsClient`.
- `fishId`, `speciesId`, `rarity`, `weightKg`.
- `locationId`, `rodId`, `baitId`, modifiers.
- `quality`, `streakState`, `sessionId`.
- `rngSeedRef`/`rngRollBucket` (без раскрытия секрета).
- `toBase`, `toFinal`, `antiAbuseFactors[]`.
- `fraudFlags[]`, `decision`.

### 5.4 Санкции и их отражение
- Stage 1: warning + ручной флаг.
- Stage 2: block ТО accrual (временный).
- Stage 3: shadow leaderboard.
- Stage 4: season ban + аннулирование наград.

---

## 6) Данные и архитектура

### 6.1 Таблицы/коллекции

1. `Season`
   - `seasonId`, `name`, `startsAt`, `endsAt`, `timezone`, `status`, `rulesetVersion`.

2. `SeasonRuleset`
   - коэффициенты, капы, DR параметры, tie-break правила.

3. `PlayerSeasonStats`
   - `playerId`, `seasonId`, `totalTO`, `rank`, `rarePlusCount`, `legendaryTO`, `speciesUniqueCount`, `firstReachedAt`, `visibilityMode`, `fraudScore`.

4. `CatchLog`
   - детальный аудит по каждому улову.

5. `LeaderboardSnapshot`
   - периодические снимки топ-N + пороги.

6. `RewardTier`
   - `seasonId`, `rankFrom`, `rankTo`, `coins`, `gems`, `items[]`, `medalId`.

7. `RewardGrant`
   - `grantId`, `seasonId`, `playerId`, `tierId`, `grantedAt`, `status`, `idempotencyKey`.

8. `MedalInventory`
   - `playerId`, `medalId`, `seasonId`, `acquiredAt`, visual metadata.

9. `CosmeticsInventory`
   - сезонные косметики и ownership.

### 6.2 Индексы/агрегации
- `PlayerSeasonStats`: `(seasonId, totalTO desc)` для ранга.
- `PlayerSeasonStats`: `(playerId, seasonId)` unique.
- `CatchLog`: `(seasonId, playerId, tsServer desc)`.
- `CatchLog`: `(seasonId, rarity, tsServer)` для анти-чита аналитики.
- Redis ZSET key: `lb:{seasonId}:global`, `lb:{seasonId}:friends:{playerId}` cache.

### 6.3 Серверные эндпойнты
- `POST /v1/fishing/catchFish` (server authoritative resolve).
- `GET /v1/championship/season/current`.
- `GET /v1/championship/leaderboard?scope=global|friends&limit=100&offset=0`.
- `GET /v1/championship/my-rank`.
- `GET /v1/championship/reward-tiers`.
- `POST /v1/championship/claim-rewards`.
- Job: `seasonCloseJob`, `seasonRewardGrantJob`, `leaderboardSnapshotJob`.

### 6.4 Идемпотентность и «не выдать дважды»
- У `claim-rewards` обязателен `idempotencyKey`.
- `RewardGrant` unique `(seasonId, playerId, tierId)`.
- Выдача через транзакцию:
  1) lock player reward row,
  2) verify eligibility,
  3) insert grant,
  4) apply wallet/inventory,
  5) commit.

---

## 7) UX / Экраны

1. **Экран турнира**
   - Таймер до конца сезона (London).
   - Мой ТО, мой ранг, текущий tier.
   - Прогресс-бар до следующего tier + «осталось Х ТО».

2. **Экран лидерборда**
   - Вкладки: Global / Friends.
   - Top list + sticky блок «Вы».
   - Кнопка «Показать меня» (jump to rank window).

3. **Экран наград сезона**
   - Полный список диапазонов с превью медалей/косметики.
   - Tooltip «как считаются ТО» в упрощенном виде.

4. **Профиль игрока**
   - История медалей по сезонам.
   - Отдельный блок «чемпионатные титулы/рамки».

---

## 8) План поэтапной реализации

### Этап 1 — MVP (2–3 недели)
- Формула A (простая), глобальный leaderboard, награды tier, season close.
- Данные: `Season`, `PlayerSeasonStats`, `RewardTier`, `RewardGrant`.
- Риски: перекос RNG, нагрузка при пиках.
- Тесты: симулятор 100k уловов, проверка распределений рангов.

### Этап 2 — Баланс и удержание (2 недели)
- Переход на формулу B, daily/weekly ТО задания, DR + soft-cap.
- Добавить `CatchLog`, анти-абуз счетчики.
- Риски: усложнение UX (непрозрачность).
- Тесты: A/B on K_r и soft-cap, retention D1/D7 impact.

### Этап 3 — Анти-чит продвинутый (2–4 недели)
- Fraud scoring pipeline, shadow mode, расследовательский дашборд.
- Риски: false positive.
- Тесты: replay наборы, ручная валидация кейсов.

### Этап 4 — Контент и ротации (ongoing)
- Тематические сезоны, косметические пулы, мини-ивенты.
- Риски: инфляция наград/усталость игроков.
- Тесты: economy guardrails, наградные KPI.

### Этап 5 — Pro-слой (опционально)
- Формула C для отдельной лиги/дивизиона.
- Риски: барьер входа.
- Тесты: только для high-skill cohort.

---

## 9) Псевдокод

### 9.1 Начисление ТО за улов

```pseudo
function processCatch(playerId, catchInput):
  season = getActiveSeason(timezone="Europe/London")
  assert season.status == "active"

  catch = serverResolveCatch(catchInput)  // rarity, weight, fishId authoritative
  base = S * K[catch.rarity] * pow(normWeight(catch), 0.85)

  Q = qualityMultiplier(catch.quality)    // Fail=0, Good=1.0, Perfect=1.12
  streak = 1 + min(getNoFailStreak(playerId), 20) * 0.01

  drSpecies = speciesDiminishing(playerId, catch.speciesId, todayLondon())
  drDailyCap = dailySoftCapMultiplier(playerId, todayLondon())
  drLegendary = legendarySeasonCapMultiplier(playerId, catch.rarity)
  drRareSeason = epicPlusSeasonDecay(playerId, catch.rarity)

  antiAbuse = drSpecies * drDailyCap * drLegendary * drRareSeason
  toFinal = round(base * Q * streak * antiAbuse)

  persistCatchLog(playerId, season.id, catch, base, toFinal, antiAbuseFactors)
  incrPlayerSeasonTO(playerId, season.id, toFinal)
  updateLeaderboardZSet(season.id, playerId, toFinal)

  return {
    toAwarded: toFinal,
    totalTO: getPlayerSeasonTO(playerId, season.id),
    newRank: getRank(season.id, playerId)
  }
```

### 9.2 Закрытие сезона и выдача наград

```pseudo
function seasonCloseJob(seasonId):
  season = loadSeason(seasonId)
  assert nowLondon() >= season.endsAt

  freezeLeaderboard(seasonId)                 // immutable final snapshot
  ranks = getFinalRanks(seasonId)

  for each player in ranks:
    tier = resolveRewardTier(player.rank)
    enqueueRewardGrant(seasonId, player.id, tier.id)

  markSeasonClosed(seasonId)

function rewardGrantWorker(task):
  with transaction:
    if exists RewardGrant(seasonId, playerId, tierId):
      return  // idempotent

    grant = createRewardGrant(..., status="pending")
    walletAddCoins(playerId, tier.coins)
    walletAddGems(playerId, tier.gems)
    grantItems(playerId, tier.items)
    grantMedal(playerId, tier.medalId, seasonId)
    setRewardGrantStatus(grant.id, "done")
```

---

## 10) Что запросить у вас для финальной калибровки (числа)

Пожалуйста, пришлите:
1. Средние веса рыбы по редкостям (min/avg/max, лучше p95).
2. Частоты выпадения C/U/R/E/L.
3. Среднее число уловов за сессию и за день (p50/p90).
4. Есть ли энергия/лимиты/бустеры/премиум.
5. Есть ли локации с модификаторами.
6. Есть ли мини-игра/подсечка/качество улова.
7. Прогрессия удочек: статы, уровни, влияние на редкость/вес.

После этого можно точно откалибровать `S`, `K_r`, soft-cap, вклад Legendary и таблицу наград под вашу экономику.
