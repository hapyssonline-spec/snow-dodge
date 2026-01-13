ICE FISH — Lake Scene Pack v1 (PNG)

Файлы:
- bg_lake_portrait.png   (портрет, 1024x1792) — фон сцены "озеро" для телефона
- bg_lake_landscape.png  (ландшафт, 1792x1024) — фон сцены "озеро" для ПК/планшета
- hero.png               — герой (PNG с прозрачностью)
- rod.png                — удочка (PNG с прозрачностью), вращать через CSS transform
- hole.png               — лунка (PNG с прозрачностью)
- bobber.png             — поплавок (PNG с прозрачностью)

Подключение (пример CSS):
#lakeScene { background: url('bg_lake_portrait.png') center/cover no-repeat; }
@media (min-aspect-ratio: 1/1) {
  #lakeScene { background-image: url('bg_lake_landscape.png'); }
}

Слои:
- hero/rod/hole/bobber кладёшь абсолютными слоями внутри #lakeScene.
