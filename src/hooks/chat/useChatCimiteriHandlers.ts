
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useChatCimiteriHandlers = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleListaCimiteriRequest = async (normalizedQuery: string) => {
    // Se la query contiene parole chiave relative alla lista dei cimiteri
    if (
      normalizedQuery.includes("mostra tutti i cimiteri") ||
      normalizedQuery.includes("elenco cimiteri") ||
      normalizedQuery.includes("lista cimiteri") ||
      (normalizedQuery.includes("mostra") && normalizedQuery.includes("cimiteri"))
    ) {
      try {
        const { data, error } = await supabase
          .from('cimiteri')
          .select('*')
          .order('nome');

        if (error) throw error;

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
    const dettaglioMatch = normalizedQuery.match(/cimitero di ([a-zA-Z\s]+)/i);
    
    if (dettaglioMatch && dettaglioMatch[1]) {
      const nomeCimitero = dettaglioMatch[1].trim();
      
      try {
        const { data, error } = await supabase
          .from('cimiteri')
          .select('*')
          .ilike('nome', `%${nomeCimitero}%`)
          .limit(1);

        if (error) throw error;
        
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
      // Prova a gestire vari tipi di richieste sui cimiteri
      if (await handleListaCimiteriRequest(normalizedQuery)) {
        return {
          message: "Ecco l'elenco di tutti i cimiteri disponibili nel sistema.",
          data: { type: "cimiteri_list" }
        };
      }
      
      if (await handleDettagliCimiteroRequest(normalizedQuery)) {
        return {
          message: "Ho trovato informazioni sul cimitero richiesto.",
          data: { type: "cimitero_details" }
        };
      }
      
      // Se non è stata trovata una gestione specifica, processa come richiesta generica
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
