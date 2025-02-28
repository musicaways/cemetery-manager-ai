
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Cimitero } from '@/pages/cimiteri/types';
import { errorReporter } from '@/lib/errorReporter';
import { toast } from 'sonner';
import { offlineManager } from '@/lib/offline/offlineManager';
import { fetchAllCimiteri, fetchCimiteroDetails, isListaCimiteriQuery, extractCimiteroName } from './utils/cimiteriUtils';

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
        const allCimiteri = await fetchAllCimiteri();
        if (allCimiteri && allCimiteri.length > 0) {
          console.log("Dati caricati dal server:", allCimiteri.length, "cimiteri");
          setCimiteri(allCimiteri);
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
      
      // Utilizza la funzione dedicata per cercare i dettagli
      const cimitero = await fetchCimiteroDetails(codice);
      if (cimitero) {
        setSelectedCimitero(cimitero);
        return cimitero;
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

  // Funzione per gestire le richieste relative ai cimiteri dalla chat
  const handleCimiteriRequest = async (query: string) => {
    const normalizedQuery = query.toLowerCase().trim();
    
    try {
      // Verifica se è una richiesta di elenco cimiteri
      if (isListaCimiteriQuery(normalizedQuery)) {
        // Carica tutti i cimiteri
        const allCimiteri = await fetchAllCimiteri();
        
        if (!allCimiteri || allCimiteri.length === 0) {
          return {
            message: "Mi dispiace, non ho trovato cimiteri disponibili al momento.",
            data: null
          };
        }
        
        return {
          message: `Ho trovato ${allCimiteri.length} cimiteri. Ecco l'elenco:`,
          data: {
            type: "cimiteri",
            cimiteri: allCimiteri
          }
        };
      }
      
      // Verifica se è una richiesta di dettagli di un cimitero specifico
      const cimiteroName = extractCimiteroName(normalizedQuery);
      if (cimiteroName) {
        const cimitero = await fetchCimiteroDetails(cimiteroName);
        
        if (!cimitero) {
          return {
            message: `Non ho trovato informazioni sul cimitero "${cimiteroName}".`,
            data: null
          };
        }
        
        return {
          message: `Ecco i dettagli del cimitero "${cimitero.Descrizione}":`,
          data: {
            type: "cimiteri",
            cimiteri: [cimitero]
          }
        };
      }
      
      // Se non è una richiesta specifica sui cimiteri
      return {
        message: "Non ho capito la tua richiesta sui cimiteri. Puoi chiedere l'elenco dei cimiteri o informazioni su un cimitero specifico.",
        data: null
      };
    } catch (error) {
      console.error("Errore nella gestione della richiesta cimiteri:", error);
      throw error;
    }
  };

  return {
    cimiteri,
    selectedCimitero,
    loading,
    fetchCimiteri,
    fetchCimiteroByCodice,
    clearSelectedCimitero,
    setSelectedCimitero,
    handleCimiteriRequest
  };
};
