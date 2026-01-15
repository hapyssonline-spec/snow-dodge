// sw.js — простой кеш для оффлайн-режима
// ВАЖНО: при изменениях увеличивай CACHE_VERSION, чтобы iPhone не держал старую версию.
// CACHE_VERSION bumped to 44 for reel hint HUD updates.
const CACHE_VERSION = 44;

const CACHE_NAME = `cache-${CACHE_VERSION}`;

const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./main.js",
  "./manifest.json",
  "./bg_lake_landscape.png",
  "./bg_lake_portrait.png",
  "./bobber.png",
  "./hero.png",
  "./rod.png",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))));
    self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const url = new URL(req.url);
    const hasV = url.searchParams.has("v");
    if (hasV) {
      try {
        return await fetch(req, { cache: "no-store" });
      } catch (e) {
        if (req.mode === "navigate") {
          const fallback = await cache.match("./index.html");
          if (fallback) return fallback;
        }
        throw e;
      }
    }
    const cached = await cache.match(req);
    if (cached) return cached;

    try {
      const fresh = await fetch(req);
      // cache successful same-origin responses
      if (fresh && fresh.ok && new URL(req.url).origin === location.origin) {
        cache.put(req, fresh.clone());
      }
      return fresh;
    } catch (e) {
      // fallback to index for navigation
      if (req.mode === "navigate") {
        const fallback = await cache.match("./index.html");
        if (fallback) return fallback;
      }
      throw e;
    }
  })());
});
