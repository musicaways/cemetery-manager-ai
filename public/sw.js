
const CACHE_VERSION = 'cemetery-ai-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Risorse essenziali che devono essere cachate immediatamente all'installazione
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/favicon.ico',
  '/site.webmanifest',
  '/lovable-uploads/70f38dc4-7f3e-43f2-8eed-da8d17a4fd4a.png'
];

// Installazione del service worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Installazione...');
  
  // Skip waiting per attivare immediatamente questo service worker
  self.skipWaiting();
  
  event.waitUntil(
    // Apri la cache statica e aggiungi tutte le risorse essenziali
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[Service Worker] Precaricamento della cache statica');
        return cache.addAll(STATIC_RESOURCES);
      })
  );
});

// Attivazione del service worker
self.addEventListener('activate', event => {
  console.log('[Service Worker] Attivazione...');
  
  // Pulizia delle cache vecchie quando si attiva una nuova versione
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          // Se la chiave non corrisponde alla versione attuale della cache, eliminala
          if (key !== STATIC_CACHE && 
              key !== DYNAMIC_CACHE && 
              key !== IMAGE_CACHE && 
              key !== API_CACHE) {
            console.log('[Service Worker] Rimozione cache vecchia', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  
  // Controlla immediatamente le pagine dei client
  return self.clients.claim();
});

// Intercetta tutte le richieste fetch
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Gestisci richieste di immagini (cache-first con fallback a rete)
  if (
    event.request.url.includes('.jpg') || 
    event.request.url.includes('.jpeg') || 
    event.request.url.includes('.png') || 
    event.request.url.includes('.webp') || 
    event.request.url.includes('.svg')
  ) {
    event.respondWith(handleImageRequest(event.request));
    return;
  }
  
  // Gestisci le richieste API supabase (network-first con fallback a cache)
  if (event.request.url.includes('supabase.co')) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }
  
  // Per le risorse statiche, usa la strategia cache-first
  if (isStaticAsset(event.request.url)) {
    event.respondWith(handleStaticRequest(event.request));
    return;
  }
  
  // Strategia generica per tutte le altre richieste
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(event.request)
        .then(response => {
          // Ignora le risposte non valide o non-get
          if (!response || response.status !== 200 || response.type !== 'basic' || event.request.method !== 'GET') {
            return response;
          }
          
          // Crea una copia della risposta perché i body possono essere letti una sola volta
          const responseToCache = response.clone();
          
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        })
        .catch(err => {
          console.error('[Service Worker] Errore di fetch:', err);
          
          // Servi una pagina di fallback per le richieste di navigazione
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          
          return new Response('Contenuto non disponibile offline', {
            status: 503,
            statusText: 'Servizio non disponibile'
          });
        });
    })
  );
});

// Gestione messaggi dal client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[Service Worker] Pulizia cache su richiesta');
    
    event.waitUntil(
      caches.keys().then(keyList => {
        return Promise.all(
          keyList.map(key => {
            return caches.delete(key).then(() => {
              console.log(`[Service Worker] Cache ${key} eliminata`);
            });
          })
        );
      })
    );
  }
  
  if (event.data && event.data.type === 'CACHE_CIMITERI') {
    const cimiteriData = event.data.cimiteri;
    
    event.waitUntil(
      caches.open(API_CACHE).then(cache => {
        // Creiamo una risposta simulata per i dati dei cimiteri
        const response = new Response(JSON.stringify({
          data: cimiteriData,
          error: null
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
        cache.put('/cached-cimiteri', response);
        console.log('[Service Worker] Dati cimiteri salvati nella cache');
      })
    );
  }
});

// Funzione per gestire le richieste di immagini (cache-first)
async function handleImageRequest(request) {
  // Prima prova dalla cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Se non in cache, prova dalla rete
  try {
    const networkResponse = await fetch(request);
    
    // Clona la risposta prima di memorizzarla nella cache
    const responseToCache = networkResponse.clone();
    
    // Memorizza in cache
    const cache = await caches.open(IMAGE_CACHE);
    await cache.put(request, responseToCache);
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Errore immagine:', error);
    
    // Potresti fornire un'immagine di fallback
    return caches.match('/placeholder.svg') || new Response('Immagine non disponibile', { status: 404 });
  }
}

// Funzione per gestire le richieste API (network-first)
async function handleApiRequest(request) {
  try {
    // Prima prova dalla rete
    const networkResponse = await fetch(request);
    
    // Clona la risposta prima di memorizzarla nella cache
    const responseToCache = networkResponse.clone();
    
    // Memorizza in cache
    const cache = await caches.open(API_CACHE);
    if (request.method === 'GET') {
      await cache.put(request, responseToCache);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Errore API:', error);
    
    // Se rete non disponibile, prova dalla cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Se è una richiesta per i cimiteri, prova a recuperare i dati dalla cache speciale
    if (request.url.includes('Cimitero')) {
      const cachedCimiteri = await caches.match('/cached-cimiteri');
      if (cachedCimiteri) {
        return cachedCimiteri;
      }
    }
    
    // Se tutto fallisce, restituisci un errore
    return new Response(JSON.stringify({ error: 'Dati non disponibili offline' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 503
    });
  }
}

// Funzione per gestire le richieste statiche (cache-first)
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    // Memorizza in cache se è una risposta valida
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Errore risorsa statica:', error);
    
    // Fallback alla home page per richieste di navigazione
    if (request.mode === 'navigate') {
      return caches.match('/');
    }
    
    return new Response('Risorsa non disponibile offline', { status: 503 });
  }
}

// Funzione per verificare se una URL è una risorsa statica
function isStaticAsset(url) {
  return (
    url.endsWith('.js') ||
    url.endsWith('.css') ||
    url.endsWith('.woff') ||
    url.endsWith('.woff2') ||
    url.endsWith('.ttf') ||
    url.endsWith('.json') ||
    url.endsWith('.ico')
  );
}
