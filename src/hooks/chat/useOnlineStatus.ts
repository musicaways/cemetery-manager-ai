
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import LocalLLMManager from '@/lib/llm/localLLMManager';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [webSearchEnabled, setWebSearchEnabled] = useState<boolean>(
    localStorage.getItem('web_search_enabled') === 'true'
  );
  const wasOffline = useRef<boolean>(false);

  useEffect(() => {
    // Update online status
    const handleOnline = () => {
      setIsOnline(true);
      console.log("Online status: connected");
      
      // Mostriamo un toast di ripristino connessione solo se eravamo offline prima
      // ma lo facciamo in modo più discreto
      if (wasOffline.current) {
        wasOffline.current = false;
        // Non mostreremo nessun toast al ripristino della connessione
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log("Online status: disconnected");
      wasOffline.current = true;
      
      // Quando si va offline, inizializza il modello locale senza mostrare toast
      const localLLM = LocalLLMManager.getInstance();
      localLLM.initialize().catch(error => {
        console.error('Errore durante l\'inizializzazione del modello in modalità offline:', error);
      });
      
      // Toast più discreto solo quando si passa in modalità offline
      toast.info('Modalità offline attivata', {
        duration: 3000
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
