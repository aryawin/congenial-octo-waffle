const CACHE_NAME = 'portfolio-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    // Add paths to any other critical assets like a main CSS file if you create one
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', event => {
    // For data requests, always go to the network to ensure content is fresh.
    if (event.request.url.includes('/src/data/')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // For all other requests, use a cache-first strategy.
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            return response || fetch(event.request).then(fetchResponse => {
                // For non-data assets, cache them if they aren't already.
                return caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, fetchResponse.clone());
                    return fetchResponse;
                });
            });
        })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
