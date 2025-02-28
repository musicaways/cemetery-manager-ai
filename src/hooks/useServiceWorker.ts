
import { useCallback, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Cimitero } from '@/pages/cimiteri/types';

export const useServiceWorker = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Controlla se il service worker è supportato e registrato
  const isServiceWorkerActive = (): boolean => {
    return navigator.serviceWorker && navigator.serviceWorker.controller !== null;
  };

  // Ascolta i messaggi di aggiornamento dal service worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
        setUpdateAvailable(true);
      }
    };
    
    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  // Accetta l'aggiornamento e ricarica la pagina
  const acceptUpdate = useCallback(() => {
    if (!isServiceWorkerActive()) return;
    
    navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }, []);

  // Invia un messaggio al service worker
  const sendMessageToServiceWorker = useCallback(async (message: any): Promise<boolean> => {
    if (!isServiceWorkerActive()) {
      console.warn('Service Worker not active, cannot send message');
      return false;
    }

    try {
      await navigator.serviceWorker.ready;
      navigator.serviceWorker.controller?.postMessage(message);
      return true;
    } catch (error) {
      console.error('Error sending message to Service Worker:', error);
      return false;
    }
  }, []);

  // Memorizza i dati dei cimiteri nel service worker per uso offline
  const cacheCimiteri = useCallback(async (cimiteri: Cimitero[]): Promise<boolean> => {
    const success = await sendMessageToServiceWorker({
      type: 'CACHE_CIMITERI_DATA',
      data: cimiteri
    });

    if (success) {
      console.log(`Cached ${cimiteri.length} cimiteri for offline use`);
    }

    return success;
  }, [sendMessageToServiceWorker]);

  // Pulisce la cache del service worker
  const clearCache = useCallback(async (): Promise<boolean> => {
    const success = await sendMessageToServiceWorker({
      type: 'CLEAR_CACHE'
    });

    if (success) {
      toast.success('Cache cancellata con successo');
    }

    return success;
  }, [sendMessageToServiceWorker]);

  // Forza la sincronizzazione delle modifiche in sospeso
  const syncPendingChanges = useCallback(async (): Promise<boolean> => {
    const success = await sendMessageToServiceWorker({
      type: 'SYNC_PENDING_CHANGES'
    });

    if (success) {
      toast.info('Sincronizzazione avviata');
    }

    return success;
  }, [sendMessageToServiceWorker]);

  return {
    isServiceWorkerActive,
    cacheCimiteri,
    clearCache,
    syncPendingChanges,
    updateAvailable,
    acceptUpdate
  };
};
