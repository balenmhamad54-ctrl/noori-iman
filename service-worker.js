const CACHE_NAME = "nuri-iman-pwa-v3";
const CORE_FILES = [
  "./",
  "./index.html",
  "./quiz.html",
  "./quran.html",
  "./tasbih.html",
  "./hadith.html",
  "./duayDastpek.html",
  "./nawPexambaran.html",
  "./nwezh.html",
  "./nyatwDastnwezh.html",
  "./dua.html",
  "./naw.html",
  "./takbirwDastpekrdnyNwezh.html",
  "./about.html",
  "./taqweem.html",
  "./farmuda.html",
  "./payekaniBawar.html",
  "./talaq.html",
  "./katakanyBang.html",
  "./qiblanma.html",
  "./zakat.html",
  "./jorakanynwezh.html",
  "./dastnwezh.html",
  "./zikrBaynyan.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // HTML pages: network first, so updated pages appear after deployment.
  if (request.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith("/")) {
    event.respondWith(
      fetch(request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() =>
        caches.match(request).then(cached => cached || caches.match("./index.html"))
      )
    );
    return;
  }

  // Other assets: cache first, then network.
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
