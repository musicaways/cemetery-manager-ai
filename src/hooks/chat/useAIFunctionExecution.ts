
import { supabase } from "@/integrations/supabase/client";
import { isListaCimiteriQuery, extractCimiteroName } from "./utils/cimiteriUtils";
import type { AIFunction } from "@/components/admin/ai-functions/types";

export const useAIFunctionExecution = () => {
  const executeAIFunction = async (functionId: string, func: AIFunction, query: string) => {
    if (!func) {
      throw new Error("Funzione non trovata");
    }

    try {
      // Identifica prima se è una richiesta di lista cimiteri
      if (isListaCimiteriQuery(query) || func.name.toLowerCase().includes("elenco cimiteri")) {
        console.log("Esecuzione funzione lista cimiteri");
        const { data: cimiteri, error } = await supabase
          .from('Cimitero')
          .select('*')
          .order('Descrizione');
          
        if (error) throw error;
        
        if (cimiteri && cimiteri.length > 0) {
          return {
            message: "Ecco l'elenco di tutti i cimiteri disponibili:",
            data: { 
              type: "cimiteri",
              cimiteri: cimiteri
            }
          };
        } else {
          return {
            message: "Non ho trovato cimiteri nel database.",
            data: { type: "generic_response" }
          };
        }
      } 
      // Gestione dettagli singolo cimitero
      else if (func.name.toLowerCase().includes("dettagli cimitero")) {
        const nomeCimitero = extractCimiteroName(query);
        
        if (!nomeCimitero) {
          return {
            message: "Per favore specifica il nome del cimitero che desideri visualizzare.",
            data: { type: "generic_response" }
          };
        }
        
        const { data: cimiteri, error } = await supabase
          .from('Cimitero')
          .select('*')
          .ilike('Descrizione', `%${nomeCimitero}%`)
          .limit(1);
        
        if (error) throw error;
        
        if (cimiteri && cimiteri.length > 0) {
          return {
            message: `Ecco le informazioni sul Cimitero ${cimiteri[0].Descrizione}`,
            data: { 
              type: "cimitero",
              cimitero: cimiteri[0]
            }
          };
        } else {
          return {
            message: `Non ho trovato informazioni sul cimitero "${nomeCimitero}". Posso aiutarti con qualcos'altro?`,
            data: { type: "generic_response" }
          };
        }
      } else {
        return {
          message: `Non ho capito quale funzione eseguire. Puoi riprovare con una richiesta più chiara?`,
          data: { type: "generic_response" }
        };
      }
    } catch (error) {
      console.error('Errore nell\'esecuzione della funzione AI:', error);
      throw new Error("Errore nell'esecuzione della funzione");
    }
  };

  // Modifichiamo questa funzione per accettare l'oggetto AIFunction
  const processTestQuery = async (func: AIFunction, query: string) => {
    try {
      // Simula l'esecuzione della funzione 
      console.log("Testing function:", func.name, "with query:", query);
      
      // Utilizziamo la stessa logica di executeAIFunction ma adattata per il test
      let result;
      
      if (isListaCimiteriQuery(query) || func.name.toLowerCase().includes("elenco cimiteri")) {
        const { data: cimiteri, error } = await supabase
          .from('Cimitero')
          .select('*')
          .order('Descrizione')
          .limit(10); // Limitiamo a 10 risultati per il test
          
        if (error) throw error;
        
        result = {
          text: `Funzione lista cimiteri eseguita. Trovati ${cimiteri?.length || 0} cimiteri.`,
          data: cimiteri
        };
      } 
      else if (func.name.toLowerCase().includes("dettagli cimitero")) {
        const nomeCimitero = extractCimiteroName(query);
        
        if (!nomeCimitero) {
          result = {
            text: "Per favore specifica il nome del cimitero che desideri visualizzare."
          };
        } else {
          const { data: cimiteri, error } = await supabase
            .from('Cimitero')
            .select('*')
            .ilike('Descrizione', `%${nomeCimitero}%`)
            .limit(1);
          
          if (error) throw error;
          
          if (cimiteri && cimiteri.length > 0) {
            result = {
              text: `Trovate informazioni per il cimitero: ${cimiteri[0].Descrizione}`,
              data: cimiteri[0]
            };
          } else {
            result = {
              text: `Non ho trovato informazioni sul cimitero "${nomeCimitero}".`
            };
          }
        }
      } else {
        // Per altre funzioni, mostriamo un messaggio generico
        result = {
          text: `Test eseguito per la funzione "${func.name}" con la query: "${query}"`
        };
      }
      
      return result;
    } catch (error) {
      console.error('Errore nel test della query:', error);
      throw error;
    }
  };

  return {
    executeAIFunction,
    processTestQuery
  };
};
