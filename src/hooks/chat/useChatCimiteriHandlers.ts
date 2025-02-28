
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Cimitero } from '@/pages/cimiteri/types';
import { errorReporter } from '@/lib/errorReporter';
import { toast } from 'sonner';
import { offlineManager } from '@/lib/offline/offlineManager';

export const useChatCimiteriHandlers = () => {
  const [cimiteri, setCimiteri] = useState<Cimitero[]>([]);
  const [selectedCimitero, setSelectedCimitero] = useState<Cimitero | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCimiteri = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Caricamento cimiteri...");
      
      // Prova prima a caricare i dati da localStorage
      const cachedData = offlineManager.getCimiteri();
      if (cachedData && cachedData.length > 0) {
        console.log("Utilizzando dati in cache:", cachedData.length, "cimiteri");
        setCimiteri(cachedData);
      }

      // Poi tenta di aggiornare i dati dal server
      if (navigator.onLine) {
        const { data, error } = await supabase
          .from('Cimitero')
          .select(`
            *,
            settori:Settore(
              Id,
              Codice,
              Descrizione,
              blocchi:Blocco(*)
            ),
            foto:CimiteroFoto(*),
            documenti:CimiteroDocumenti(*)
          `)
          .order('Descrizione', { ascending: true });

        if (error) {
          throw error;
        }

        if (data) {
          console.log("Dati caricati dal server:", data.length, "cimiteri");
          setCimiteri(data as Cimitero[]);
          
          // Salva i dati nel localStorage per utilizzo offline
          offlineManager.saveCimiteri(data as Cimitero[]);
        }
      }
    } catch (error) {
      console.error("Errore nel caricamento dei cimiteri:", error);
      errorReporter.reportError(error as Error, { action: 'fetchCimiteri' });
      
      // Fallback sui dati in cache anche se eravamo online
      const cachedData = offlineManager.getCimiteri();
      if (cachedData && cachedData.length > 0 && cimiteri.length === 0) {
        console.log("Fallback sui dati in cache dopo errore");
        setCimiteri(cachedData);
        toast.warning("Utilizzando dati in cache", {
          description: "Non è stato possibile aggiornare i dati dal server"
        });
      }
    } finally {
      setLoading(false);
    }
  }, [cimiteri.length]);

  const fetchCimiteroByCodice = useCallback(async (codice: string) => {
    try {
      setLoading(true);
      console.log("Caricamento cimitero con codice:", codice);
      
      // Cerca prima nei dati già caricati
      const cimiteroFromLoaded = cimiteri.find(c => 
        c.Codice?.toLowerCase() === codice.toLowerCase() || 
        c.Descrizione?.toLowerCase().includes(codice.toLowerCase())
      );
      
      if (cimiteroFromLoaded) {
        console.log("Cimitero trovato nei dati già caricati:", cimiteroFromLoaded);
        setSelectedCimitero(cimiteroFromLoaded);
        return cimiteroFromLoaded;
      }
      
      // Cerca nella cache
      const cachedData = offlineManager.getCimiteri();
      const cimiteroFromCache = cachedData?.find(c => 
        c.Codice?.toLowerCase() === codice.toLowerCase() || 
        c.Descrizione?.toLowerCase().includes(codice.toLowerCase())
      );
      
      if (cimiteroFromCache) {
        console.log("Cimitero trovato nella cache:", cimiteroFromCache);
        setSelectedCimitero(cimiteroFromCache);
        return cimiteroFromCache;
      }
      
      // Carica dal server se online
      if (navigator.onLine) {
        const { data, error } = await supabase
          .from('Cimitero')
          .select(`
            *,
            settori:Settore(
              Id,
              Codice,
              Descrizione,
              blocchi:Blocco(*)
            ),
            foto:CimiteroFoto(*),
            documenti:CimiteroDocumenti(*)
          `)
          .or(`Codice.ilike.%${codice}%,Descrizione.ilike.%${codice}%`)
          .limit(1);

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          console.log("Cimitero caricato dal server:", data[0]);
          setSelectedCimitero(data[0] as Cimitero);
          return data[0] as Cimitero;
        }
      }
      
      console.log("Nessun cimitero trovato con codice/descrizione:", codice);
      return null;
    } catch (error) {
      console.error("Errore nel caricamento del cimitero:", error);
      errorReporter.reportError(error as Error, { action: 'fetchCimiteroByCodice', codice });
      return null;
    } finally {
      setLoading(false);
    }
  }, [cimiteri]);

  const clearSelectedCimitero = useCallback(() => {
    setSelectedCimitero(null);
  }, []);

  return {
    cimiteri,
    selectedCimitero,
    loading,
    fetchCimiteri,
    fetchCimiteroByCodice,
    clearSelectedCimitero,
    setSelectedCimitero
  };
};
