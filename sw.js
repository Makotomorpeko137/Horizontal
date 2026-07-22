// KIEDY WYDAJESZ NOWY NUMER ZINU: zmieniasz wersję z v1 na v2 itd.
const CACHE_NAME = 'horizontal-zine-v1';

// Lista plików składających się na aplikację
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

// 1. Instalacja — pobieranie świeżych zasobów do keszu
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Zmusza nowy Service Worker do natychmiastowej aktywacji
  self.skipWaiting();
});

// 2. Aktywacja — usuwanie starych wersji keszu (np. gdy wydasz v2)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Usuwanie starego keszu:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Pobieranie danych — najpierw sieć, a jak brak połączenia, to z keszu
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Jeśli pobrano z sieci, aktualizujemy kopię w keszu
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Jeśli nie ma sieci (offline), serwujemy zapisaną wersję
        return caches.match(event.request);
      })
  );
});
