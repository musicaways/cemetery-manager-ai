
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface UseServiceWorkerReturn {
  hasNewVersion: boolean;
  updateServiceWorker: () => void;
  cacheCimiteri: (cimiteri: any[]) => void;
  clearCache: () => void;
}

export const useServiceWorker = (): UseServiceWorkerReturn => {
  const [hasNewVersion, setHasNewVersion] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Inizializza e monitora il service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Cerca un service worker già registrato
      navigator.serviceWorker.ready.then(reg => {
        setRegistration(reg);
        console.log('Service worker pronto');
      });

      // Event listener per gli aggiornamenti del service worker
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Controller cambiato - service worker aggiornato');
      });

      // Controlla gli aggiornamenti
      const interval = setInterval(() => {
        if (registration) {
          registration.update().catch(error => {
            console.error('Errore durante l\'aggiornamento del service worker:', error);
          });
        }
      }, 60 * 60 * 1000); // Controlla ogni ora

      return () => clearInterval(interval);
    }
  }, [registration]);

  // Event listener per i messaggi dal service worker
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NEW_VERSION') {
        setHasNewVersion(true);
        toast.info('Nuova versione disponibile', {
          description: 'Aggiorna per accedere alle nuove funzionalità',
          action: {
            label: 'Aggiorna',
            onClick: () => updateServiceWorker()
          },
          duration: 10000
        });
      }
    };

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.addEventListener('message', handleMessage);
      return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
    }
  }, []);

  // Funzione per aggiornare il service worker
  const updateServiceWorker = () => {
    if (registration && registration.waiting) {
      // Invia un messaggio al service worker in attesa per farlo diventare attivo
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setHasNewVersion(false);
    }
  };

  // Funzione per memorizzare i dati dei cimiteri nel service worker
  const cacheCimiteri = (cimiteri: any[]) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_CIMITERI',
        cimiteri
      });
      console.log('Dati cimiteri inviati al service worker per il caching');
    }
  };

  // Funzione per pulire la cache
  const clearCache = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_CACHE'
      });
      toast.success('Cache pulita con successo');
    }
  };

  return {
    hasNewVersion,
    updateServiceWorker,
    cacheCimiteri,
    clearCache
  };
};
