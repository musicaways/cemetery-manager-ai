
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

  const processTestQuery = async (aiProvider: string, aiModel: string) => {
    try {
      let testQuery = "Questo è un test della funzione AI";
      
      const response = await supabase.functions.invoke('process-query', {
        body: { 
          query: testQuery,
          aiProvider,
          aiModel
        }
      });
      
      if (response.error) {
        throw response.error;
      }
      
      return response.data;
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
