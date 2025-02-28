
// Versione della cache
const CACHE_VERSION = 'v1.1.0';
const CACHE_NAME = `cimiteri-app-cache-${CACHE_VERSION}`;

// Lista delle risorse da cachare
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/favicon.svg',
  '/og-image.png',
  '/placeholder.svg',
  '/site.webmanifest'
];

// Installazione del service worker
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  
  // Precache delle risorse statiche
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching static resources');
      return cache.addAll(STATIC_RESOURCES);
    })
  );
  
  // Attiva immediatamente il nuovo service worker
  self.skipWaiting();
});

// Attivazione del service worker
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  
  // Pulisce le vecchie cache
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Prende immediatamente il controllo di tutte le pagine
  self.clients.claim();
});

// Intercetta le richieste di rete
self.addEventListener('fetch', (event) => {
  // Ignora le richieste che non sono GET
  if (event.request.method !== 'GET') return;
  
  // Ignora le richieste alle API
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('/auth/') ||
      event.request.url.includes('/rest/') ||
      event.request.url.includes('/storage/')) {
    return;
  }
  
  // Strategia per le risorse statiche
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Se la risorsa è nella cache, la restituiamo
      if (response) {
        return response;
      }
      
      // Altrimenti facciamo una richiesta di rete
      return fetch(event.request).then((networkResponse) => {
        // Se la risposta non è valida, restituiscila direttamente
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        
        // Clona la risposta per poterla usare sia per la cache che per il client
        const responseToCache = networkResponse.clone();
        
        // Cachare solo le risorse statiche (come JS, CSS, immagini)
        if (event.request.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        
        return networkResponse;
      }).catch(() => {
        // Se la rete fallisce e la risorsa è un'immagine, restituisci un'immagine placeholder
        if (event.request.url.match(/\.(png|jpg|jpeg|gif|svg)$/)) {
          return caches.match('/placeholder.svg');
        }
        
        // Altrimenti restituisci un errore
        return new Response('Network error', { status: 408, headers: { 'Content-Type': 'text/plain' } });
      });
    })
  );
});

// Gestione dei messaggi
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[ServiceWorker] Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    });
  }
});

// Funzioni per il salvataggio offline dei cimiteri
let cimiteriData = [];

// Salva i dati dei cimiteri
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_CIMITERI') {
    cimiteriData = event.data.cimiteri || [];
    console.log('[ServiceWorker] Cached', cimiteriData.length, 'cimiteri');
  }
});

// Fornisce accesso offline ai dati dei cimiteri
function handleCimiteriRequest(request) {
  const url = new URL(request.url);
  
  // Se è una richiesta per tutti i cimiteri
  if (url.pathname.endsWith('/Cimitero')) {
    return new Response(JSON.stringify({ data: cimiteriData }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Se è una richiesta per un singolo cimitero
  const idMatch = url.pathname.match(/\/Cimitero\/(\d+)/);
  if (idMatch) {
    const id = parseInt(idMatch[1]);
    const cimitero = cimiteriData.find(c => c.Id === id);
    
    if (cimitero) {
      return new Response(JSON.stringify({ data: cimitero }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Richiesta non supportata offline
  return new Response(JSON.stringify({ error: 'Dati non disponibili offline' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}
