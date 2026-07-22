const CACHE_NAME = 'horizontal-zine-v5';

// ... (instalacja i aktywacja bez zmian) ...

self.addEventListener('fetch', (event) => {
  // OTO KLUCZOWA LINIJKA: Olewamy zapytania pochodzące z rozszerzeń (chrome-extension://)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
