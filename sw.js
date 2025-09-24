const CACHE_NAME = "checklist-pwa-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  // network-first for same-origin HTML; cache-first for others
  if (request.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const net = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, net.clone());
        return net;
      } catch {
        const cache = await caches.open(CACHE_NAME);
        return await cache.match("./index.html");
      }
    })());
  } else {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const match = await cache.match(request);
      if (match) return match;
      try {
        const net = await fetch(request);
        cache.put(request, net.clone());
        return net;
      } catch {
        return match || Response.error();
      }
    })());
  }
});
