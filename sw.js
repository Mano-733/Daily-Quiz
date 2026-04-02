var CACHE_NAME = 'mcq-app-v4';
var FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// Install — cache all files
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate — delete old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// Fetch — serve from cache, fall back to network
// Also updates cache in background when online (stale-while-revalidate)
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.match(event.request).then(function(cachedResponse) {
        var fetchPromise = fetch(event.request).then(function(networkResponse) {
          // Update cache with fresh version from network
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        }).catch(function() {
          // Network failed — return cached version if available
          return cachedResponse;
        });
        // Return cached version immediately (fast), update in background
        return cachedResponse || fetchPromise;
      });
    })
  );
});
