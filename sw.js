const NOM_CACHE = 'escale-241-pos-v3';
const FICHIERS_CACHE = [
  './',
  './index.html',
  './tokens.css',
  './styles.css',
  './app.js',
  './manifest.json',
  './icone-192.png',
  './icone-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(NOM_CACHE).then(function (cache) {
      return cache.addAll(FICHIERS_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cles) {
      return Promise.all(
        cles.map(function (cle) {
          if (cle !== NOM_CACHE) {
            return caches.delete(cle);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (reponseCache) {
      return reponseCache || fetch(event.request);
    })
  );
});
