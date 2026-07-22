// Podbijamy wersję, aby przeglądarka odświeżyła skrypt
const CACHE_NAME = 'horizontal-zine-v4';

// Lista podstawowych plików do keszowania
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json'
];

// 1. Instalacja
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Aktywacja i czyszczenie starych wersji
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Pobieranie danych — Z ZABEZPIECZENIEM PRZED WTYCZKAMI
self.addEventListener('fetch', (event) => {
  // IGNORUJEMY ruch z rozszerzeń przeglądarki (np. chrome-extension://)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Zapisujemy do keszu tylko poprawne odpowiedzi z naszego serwera
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // W trybie offline serwujemy dane z keszu
        return caches.match(event.request);
      })
  );
});
