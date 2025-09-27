// Mess Tracker Service Worker
const CACHE_NAME = 'mess-tracker-v1.0.0';
const STATIC_CACHE = 'mess-tracker-static-v1.0.0';
const DYNAMIC_CACHE = 'mess-tracker-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Cache installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http schemes
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // Handle different types of requests
  if (url.pathname === '/' || url.pathname === '/index.html') {
    // Serve main page from cache
    event.respondWith(serveFromCache(request, STATIC_CACHE));
  } else if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
    // Serve static assets from cache
    event.respondWith(serveFromCache(request, STATIC_CACHE));
  } else if (url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg') || url.pathname.endsWith('.ico')) {
    // Serve images from cache
    event.respondWith(serveFromCache(request, DYNAMIC_CACHE));
  } else {
    // For other requests, try network first
    event.respondWith(networkFirst(request));
  }
});

// Serve from cache with fallback to network
async function serveFromCache(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Service Worker: Serving from cache:', request.url);
      return cachedResponse;
    }
    
    // If not in cache, fetch from network and cache it
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      try {
        await cache.put(request, networkResponse.clone());
      } catch (cacheError) {
        console.log('Service Worker: Cache put failed (non-critical):', cacheError.message);
        // Continue without caching - this is not critical
      }
    }
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Cache fetch failed', error);
    return new Response('Offline - Content not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Network first strategy
async function networkFirst(request) {
  try {
    // Skip non-http requests
    const url = new URL(request.url);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return new Response('Unsupported protocol', { status: 400 });
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      try {
        const cache = await caches.open(DYNAMIC_CACHE);
        await cache.put(request, networkResponse.clone());
      } catch (cacheError) {
        console.log('Service Worker: Cache put failed (non-critical):', cacheError.message);
        // Continue without caching - this is not critical
      }
    }
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache:', request.url);
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    return cachedResponse || new Response('Offline - Content not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered');
  if (event.tag === 'mess-data-sync') {
    event.waitUntil(syncMessData());
  }
});

// Sync mess data when back online
async function syncMessData() {
  try {
    // Get pending changes from IndexedDB
    const pendingChanges = await getPendingChanges();
    
    if (pendingChanges.length > 0) {
      console.log('Service Worker: Syncing pending changes:', pendingChanges.length);
      // Here you would sync with a server if you had one
      // For now, we'll just mark them as synced
      await markChangesAsSynced(pendingChanges);
    }
  } catch (error) {
    console.error('Service Worker: Sync failed', error);
  }
}

// Get pending changes from IndexedDB
async function getPendingChanges() {
  // This would integrate with IndexedDB to get pending changes
  // For now, return empty array
  return [];
}

// Mark changes as synced
async function markChangesAsSynced(changes) {
  // This would update IndexedDB to mark changes as synced
  console.log('Service Worker: Changes marked as synced');
}


// Message handling from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urlsToCache = event.data.urls;
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then((cache) => cache.addAll(urlsToCache))
    );
  }
});
