
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useChatCimiteriHandlers = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleListaCimiteriRequest = async (normalizedQuery: string) => {
    // Se la query contiene parole chiave relative alla lista dei cimiteri
    console.log("Controllo se è una richiesta di lista cimiteri:", normalizedQuery);
    
    if (
      normalizedQuery.includes("mostra tutti i cimiteri") ||
      normalizedQuery.includes("elenco cimiteri") ||
      normalizedQuery.includes("lista cimiteri") ||
      (normalizedQuery.includes("mostra") && normalizedQuery.includes("cimiteri"))
    ) {
      console.log("Richiesta lista cimiteri identificata");
      try {
        const { data, error } = await supabase
          .from('Cimitero')
          .select('*')
          .order('Descrizione');

        if (error) {
          console.error("Errore Supabase:", error);
          throw error;
        }

        console.log("Cimiteri recuperati:", data?.length || 0);
        return true;
      } catch (error) {
        console.error('Errore nel recupero dei cimiteri:', error);
        return false;
      }
    }
    
    return false;
  };

  const handleDettagliCimiteroRequest = async (normalizedQuery: string) => {
    // Rileva richieste di dettagli su un cimitero specifico
    console.log("Controllo se è una richiesta di dettagli cimitero:", normalizedQuery);
    
    const dettaglioMatch = normalizedQuery.match(/cimitero\s+(?:di\s+)?([a-zA-Z\s]+)/i);
    
    if (dettaglioMatch && dettaglioMatch[1]) {
      const nomeCimitero = dettaglioMatch[1].trim();
      console.log("Nome cimitero estratto:", nomeCimitero);
      
      try {
        const { data, error } = await supabase
          .from('Cimitero')
          .select('*')
          .ilike('Descrizione', `%${nomeCimitero}%`)
          .limit(1);

        if (error) {
          console.error("Errore Supabase:", error);
          throw error;
        }
        
        console.log("Dettagli cimitero trovati:", data?.length || 0);
        
        if (data && data.length > 0) {
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('Errore nel recupero del cimitero:', error);
        return false;
      }
    }
    
    return false;
  };

  const handleCimiteriRequest = async (query: string) => {
    setIsProcessing(true);
    const normalizedQuery = query.toLowerCase().trim();
    
    try {
      console.log("Gestione richiesta cimiteri:", normalizedQuery);
      
      // Prova a gestire vari tipi di richieste sui cimiteri
      if (await handleListaCimiteriRequest(normalizedQuery)) {
        console.log("Richiesta gestita come lista cimiteri");
        return {
          message: "Ecco l'elenco di tutti i cimiteri disponibili nel sistema.",
          data: { type: "cimiteri_list" }
        };
      }
      
      if (await handleDettagliCimiteroRequest(normalizedQuery)) {
        console.log("Richiesta gestita come dettagli cimitero");
        return {
          message: "Ho trovato informazioni sul cimitero richiesto.",
          data: { type: "cimitero_details" }
        };
      }
      
      // Se non è stata trovata una gestione specifica, processa come richiesta generica
      console.log("Richiesta gestita come generica");
      return {
        message: "La tua richiesta sui cimiteri richiede ulteriori informazioni. Puoi essere più specifico?",
        data: { type: "generic_response" }
      };
    } catch (error) {
      console.error('Errore nella gestione della richiesta sui cimiteri:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    handleListaCimiteriRequest,
    handleDettagliCimiteroRequest,
    handleCimiteriRequest
  };
};
