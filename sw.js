// sw.js — простой Service Worker для кэша игры

const CACHE_NAME = 'ios-strategy-cache-v1';
const ASSETS = [
  'index.html',
  'style.css',
  'main.js',
  'manifest.json',
  // Добавь сюда свои ассеты: картинки, звуки, шрифты и т.д.
  // 'assets/tiles.png',
  // 'assets/hero.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Если нашли в кэше — отдаём, иначе идём в сеть
      return response || fetch(event.request);
    })
  );
});
