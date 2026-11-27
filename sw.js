const NOM_CACHE = 'escale-241-pos-v4';
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

// Réseau d'abord (3 s maximum) pour récupérer les mises à jour automatiquement,
// puis cache si le réseau est absent ou trop lent. Fonctionne donc hors-ligne.
self.addEventListener('fetch', function (event) {
  const requete = event.request;
  if (requete.method !== 'GET' || new URL(requete.url).origin !== self.location.origin) {
    return;
  }
  event.respondWith(
    (function () {
      const reseau = fetch(requete).then(function (reponse) {
        if (reponse && reponse.ok) {
          const copie = reponse.clone();
          caches.open(NOM_CACHE).then(function (cache) { cache.put(requete, copie); });
        }
        return reponse;
      });
      const delai = new Promise(function (resolve) {
        setTimeout(function () { resolve(null); }, 3000);
      });
      return Promise.race([reseau, delai]).then(function (premier) {
        if (premier) return premier;
        return caches.match(requete).then(function (enCache) {
          return enCache || reseau;
        });
      }).catch(function () {
        return caches.match(requete);
      });
    })()
  );
});
