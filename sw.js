const CACHE_NAME = 'photo-flipbook-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    'https://cdn.jsdelivr.net/npm/page-flip@2.0.7/dist/js/page-flip.browser.min.js'
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching essential assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch((error) => {
                console.error('Failed to cache assets:', error);
            })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Return cached response if found
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Otherwise, fetch from network
                return fetch(event.request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Cache images and other assets
                        if (event.request.url.includes('/images/') || 
                            event.request.url.includes('.css') || 
                            event.request.url.includes('.js')) {
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                });
                        }

                        return response;
                    })
                    .catch((error) => {
                        console.error('Fetch failed:', error);
                        // Return a custom offline page if available
                        return caches.match('/index.html');
                    });
            })
    );
});
