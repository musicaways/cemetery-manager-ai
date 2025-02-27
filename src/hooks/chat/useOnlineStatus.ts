
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import LocalLLMManager from '@/lib/llm/localLLMManager';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [webSearchEnabled, setWebSearchEnabled] = useState<boolean>(
    localStorage.getItem('web_search_enabled') === 'true'
  );

  useEffect(() => {
    // Update online status
    const handleOnline = () => {
      setIsOnline(true);
      console.log("Online status: connected");
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log("Online status: disconnected");
      
      // Quando si va offline, inizializza il modello locale
      const localLLM = LocalLLMManager.getInstance();
      localLLM.initialize().catch(error => {
        console.error('Errore durante l\'inizializzazione del modello in modalità offline:', error);
      });
      
      toast.error('Connessione persa', {
        description: 'Sei passato in modalità offline. Verrà utilizzato il modello locale per le risposte.',
        duration: 5000
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleWebSearch = () => {
    const newValue = !webSearchEnabled;
    setWebSearchEnabled(newValue);
    localStorage.setItem('web_search_enabled', newValue.toString());
  };

  return { isOnline, webSearchEnabled, toggleWebSearch };
};
