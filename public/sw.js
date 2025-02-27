// Service Worker for cemetery management app
const CACHE_NAME = 'cemetery-app-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/placeholder.svg',
  '/assets/index.js', // Main app bundle
  '/assets/index.css', // Main styles
];

// Dynamic cache for runtime resources
const DYNAMIC_CACHE = 'cemetery-dynamic-v1';

// DB table names to cache offline
const DB_TABLES = ['Cimitero', 'Settore', 'Blocco', 'CimiteroFoto', 'CimiteroDocumenti', 'defunti', 'loculi'];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  
  // Claim clients to control all tabs immediately
  event.waitUntil(clients.claim());
  
  // Remove old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME && name !== DYNAMIC_CACHE) {
            console.log('[Service Worker] Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
});

// Listen for messages from clients
self.addEventListener('message', event => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'CACHE_CIMITERI_DATA':
      // Cache cimiteri data received from the app
      console.log('[Service Worker] Caching cimiteri data');
      cacheCimiteriData(data);
      break;
      
    case 'CLEAR_CACHE':
      // Clear specific or all caches
      console.log('[Service Worker] Clearing cache');
      caches.delete(DYNAMIC_CACHE);
      break;
      
    case 'SYNC_PENDING_CHANGES':
      // Trigger sync of pending changes
      console.log('[Service Worker] Syncing pending changes');
      syncPendingChanges();
      break;
  }
});

// Cache cimiteri data for offline use
async function cacheCimiteriData(cimiteri) {
  if (!cimiteri || !Array.isArray(cimiteri)) return;
  
  const cache = await caches.open(DYNAMIC_CACHE);
  
  // Store a JSON representation for the IndexedDB data
  const cimiteriBlob = new Blob([JSON.stringify(cimiteri)], { type: 'application/json' });
  const cimiteriResponse = new Response(cimiteriBlob);
  
  await cache.put('/api/cached-cimiteri', cimiteriResponse);
  
  // Cache cemetery images
  cimiteri.forEach(cimitero => {
    // Cache cover image
    if (cimitero.FotoCopertina) {
      fetch(cimitero.FotoCopertina)
        .then(response => {
          if (response.ok) {
            cache.put(cimitero.FotoCopertina, response.clone());
          }
        })
        .catch(err => console.error('[SW] Failed to cache image:', err));
    }
    
    // Cache additional photos
    if (cimitero.foto && Array.isArray(cimitero.foto)) {
      cimitero.foto.forEach(foto => {
        if (foto.Url) {
          fetch(foto.Url)
            .then(response => {
              if (response.ok) {
                cache.put(foto.Url, response.clone());
              }
            })
            .catch(err => console.error('[SW] Failed to cache photo:', err));
        }
      });
    }
  });
}

// Sync pending changes with the server
async function syncPendingChanges() {
  // Handled by the IndexedDB manager in the app
  // This function is a hook for future implementations
  console.log('[Service Worker] Sync functionality called');
}

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests or those not on our origin
  if (event.request.method !== 'GET') return;
  
  // Strategy: Cache-First then Network with Dynamic Caching
  // Exception: Supabase API calls
  if (event.request.url.includes('supabase.co/rest/v1')) {
    // For Supabase API calls, check if it's a DB_TABLE request first
    const isDbTableRequest = DB_TABLES.some(table => 
      event.request.url.includes(`/rest/v1/${table}`)
    );
    
    if (isDbTableRequest) {
      // For DB tables, try cached data first, then network
      event.respondWith(
        caches.match(event.request)
          .then(cachedResponse => {
            // Return cached response if available and still valid
            if (cachedResponse) {
              // Check if cache is less than 1 hour old
              const headers = cachedResponse.headers;
              const cacheDate = headers.get('sw-cache-date');
              
              if (cacheDate) {
                const cacheTime = new Date(cacheDate).getTime();
                const now = Date.now();
                const oneHour = 1000 * 60 * 60;
                
                if (now - cacheTime < oneHour) {
                  return cachedResponse;
                }
              }
            }
            
            // Otherwise fetch from network
            return fetch(event.request.clone())
              .then(response => {
                if (!response || response.status !== 200) {
                  return response;
                }
                
                // Cache the new response
                const responseToCache = response.clone();
                caches.open(DYNAMIC_CACHE)
                  .then(cache => {
                    // Add cache timestamp header
                    const headers = new Headers(responseToCache.headers);
                    headers.append('sw-cache-date', new Date().toISOString());
                    
                    // Create a new response with the timestamp header
                    const timestampedResponse = new Response(
                      responseToCache.body, 
                      {
                        status: responseToCache.status,
                        statusText: responseToCache.statusText,
                        headers: headers
                      }
                    );
                    
                    cache.put(event.request, timestampedResponse);
                  });
                
                return response;
              })
              .catch(() => {
                // If network fails and we have a cached response, return it even if expired
                if (cachedResponse) {
                  console.log('[SW] Returning expired cached response for:', event.request.url);
                  return cachedResponse;
                }
                
                // Otherwise return a custom offline response for API requests
                return new Response(
                  JSON.stringify({ 
                    error: true, 
                    message: 'You are offline', 
                    offline: true 
                  }),
                  { headers: { 'Content-Type': 'application/json' } }
                );
              });
          })
      );
      return;
    }
    
    // For other Supabase API calls, try network first, then fallback to custom response
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return new Response(
            JSON.stringify({ 
              error: true, 
              message: 'You are offline', 
              offline: true 
            }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }
  
  // For static assets and other requests
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Return the cached response
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Don't cache if response is not valid
            if (!response || response.status !== 200) {
              return response;
            }
            
            // Cache successful responses
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            // Check if this is a navigation request
            if (event.request.mode === 'navigate') {
              // Return the offline page
              return caches.match('/');
            }
            
            // Otherwise just propagate the error
            throw error;
          });
      })
  );
});

// Handle push notifications
self.addEventListener('push', event => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Nuova notifica',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: data.data || {},
      actions: data.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Gestione Cimiteri', options)
    );
  } catch (error) {
    console.error('[SW] Push notification error:', error);
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(windowClients => {
        // Check if there is already a window open
        for (const client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

console.log('[Service Worker] Initialized');
