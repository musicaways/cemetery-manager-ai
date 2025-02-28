
import { useEffect } from "react";
import { toast } from "sonner";

// Componente per la pulizia della cache e il controllo del service worker
export const ServiceWorkerCleanup = () => {
  useEffect(() => {
    const clearSWCache = async () => {
      try {
        // Controlla se esiste un serviceWorker registrato
        if ('serviceWorker' in navigator) {
          // Ottieni tutte le registrazioni
          const registrations = await navigator.serviceWorker.getRegistrations();
          
          // Se ci sono registrazioni, unregister
          for (const registration of registrations) {
            await registration.unregister();
            console.log('Service Worker unregistrato con successo');
          }
          
          // Pulisci anche le cache
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
              cacheNames.map(cacheName => caches.delete(cacheName))
            );
            console.log('Cache pulite con successo');
          }
          
          // Registra nuovamente il service worker
          await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registrato nuovamente');
          
          toast.success('Cache e Service Worker aggiornati', {
            description: 'L\'applicazione è stata ricaricata per applicare le modifiche.'
          });
        }
      } catch (error) {
        console.error('Errore nella pulizia della cache:', error);
      }
    };

    // Esegui la pulizia una volta all'avvio dell'applicazione
    clearSWCache();
  }, []);

  return null;
};

// Funzione per forzare l'aggiornamento della pagina
export const forcePageRefresh = () => {
  window.location.reload();
};
