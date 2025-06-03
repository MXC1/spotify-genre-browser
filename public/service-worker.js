// This service worker can be used with Create React App
// It implements a cache-first strategy for static assets and a network-first for API calls

const CACHE_NAME = 'cra-cache-v1';
const RUNTIME_CACHE = 'runtime-cache';

// Assets that should be pre-cached when the service worker installs
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.bundle.js', // Your main JS bundle (name might vary)
  '/static/css/main.css',      // Your main CSS (name might vary)
  '/manifest.json',
  '/favicon.ico'
  // Add any other static assets your app needs
];

// Installation - Cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting()) // Force activation on all clients
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      // Clone the request because it's a one-time-use stream
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest).catch((error) => {
        // Only return index.html for navigation and document requests
        if (event.request.mode === 'navigate' ||
            (event.request.method === 'GET' &&
             event.request.headers.get('accept').includes('text/html'))) {
          return caches.match('/index.html');
        }
        // For other requests (like .js files), let the error propagate
        throw error;
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
      })
      .then(cachesToDelete => {
        return Promise.all(
          cachesToDelete.map(cacheToDelete => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim()) // Take control of all clients
  );
});

// Add message handler to skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});