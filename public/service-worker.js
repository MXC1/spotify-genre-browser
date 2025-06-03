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
        // Only return index.html for navigation requests
        if (event.request.mode === 'navigate') {
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

// Fetch handler with different strategies based on request type
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle API calls with network-first strategy
  if (event.request.url.includes('/api/')) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }

  // Handle static assets with cache-first strategy
  event.respondWith(cacheFirstStrategy(event.request));
});

// Cache-first strategy for static assets
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    // Cache the new resource if it's a valid response
    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return the offline page for navigation requests
    if (request.mode === 'navigate') {
      const cache = await caches.open(CACHE_NAME);
      return cache.match('/index.html');
    }
    
    throw error;
  }
}

// Network-first strategy for API calls
async function networkFirstStrategy(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache the response for offline use
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // If network fails, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache either, fail gracefully
    throw error;
  }
}

// This allows the service worker to be updated from the main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});