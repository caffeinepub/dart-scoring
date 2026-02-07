// Service worker for offline PWA support
// Optimized for reverse proxy deployments

const CACHE_NAME = 'dart-scoring-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/assets/generated/dart-scoring-icon.dim_192x192.png',
  '/assets/generated/dart-scoring-icon.dim_512x512.png',
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control immediately
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
// Proxy-friendly: preserves asset paths and handles SPA routing
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  // When behind a reverse proxy, this ensures we only cache our own assets
  if (url.origin !== self.location.origin) {
    return;
  }

  // For navigation requests (HTML pages), try network first, fallback to cache
  // This ensures users get the latest version when online
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache the response
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request).then((cachedResponse) => {
            // If no cached response, return the cached index.html for SPA routing
            // This enables offline navigation for TanStack Router
            return cachedResponse || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // For other requests (JS, CSS, images), try cache first, fallback to network
  // This provides fast offline access to static assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone and cache the response
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });

        return response;
      });
    })
  );
});

// Message event - allow manual cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

// Notes for reverse proxy deployments:
// 1. Asset paths remain unchanged - proxy should not rewrite URLs
// 2. Cache-Control headers from proxy are respected
// 3. SPA routing fallback to index.html works regardless of proxy
// 4. Service worker scope is "/" - ensure proxy doesn't restrict this
// 5. HTTPS is required for service workers (handled by proxy)
