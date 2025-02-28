
import { supabase } from "@/integrations/supabase/client";
import { offlineManager } from "@/lib/offline/offlineManager";
import { AIFunction } from "@/components/admin/ai-functions/types";
import { isListaCimiteriQuery, extractCimiteroName, fetchAllCimiteri, fetchCimiteroDetails } from "./utils/cimiteriUtils";

export const useAIFunctionExecution = () => {
  // Esegue una funzione AI
  const executeAIFunction = async (functionId: string, func: AIFunction, query: string) => {
    console.log(`Esecuzione funzione AI: ${func.name}(${functionId}) con query: ${query}`);
    
    try {
      let result: any = null;
      
      // Esecuzioni speciali per funzioni predefinite
      if (func.name.toLowerCase().includes("lista cimiteri") || 
          func.name.toLowerCase().includes("elenco cimiteri")) {
        // Funzione lista cimiteri
        result = await handleListaCimiteri();
      } else if (func.name.toLowerCase().includes("mostra dettagli cimitero") || 
                func.name.toLowerCase().includes("dettagli cimitero")) {
        // Funzione dettagli cimitero
        const cimiteroName = extractCimiteroName(query);
        result = await handleDettagliCimitero(cimiteroName || "");
      } else {
        // Esecuzione generica tramite il codice della funzione
        try {
          // Usa eval con cautela, solo in modalità di sviluppo
          const funcCode = `(async (query) => { ${func.code} })`;
          const executableFunc = eval(funcCode);
          result = await executableFunc(query);
        } catch (execError) {
          console.error("Errore nell'esecuzione del codice funzione:", execError);
          throw new Error(`Errore nell'esecuzione della funzione: ${execError.message}`);
        }
      }
      
      // Formatta il risultato
      return {
        message: result?.message || "Funzione eseguita con successo",
        data: result?.data || null
      };
    } catch (error) {
      console.error(`Errore nell'esecuzione della funzione ${func.name}:`, error);
      return {
        message: `Si è verificato un errore: ${error.message}`,
        data: null
      };
    }
  };

  // Gestisce la funzione lista cimiteri
  const handleListaCimiteri = async () => {
    try {
      console.log("Executing lista cimiteri function...");
      const cimiteri = await fetchAllCimiteri();
      
      if (!cimiteri || cimiteri.length === 0) {
        return {
          message: "Non ho trovato cimiteri disponibili.",
          data: null
        };
      }
      
      let message = `Ho trovato ${cimiteri.length} cimiteri disponibili:`;
      
      return {
        message: message,
        data: {
          type: "cimiteri",
          cimiteri: cimiteri
        }
      };
    } catch (error) {
      console.error("Error in handleListaCimiteri:", error);
      throw error;
    }
  };

  // Gestisce la funzione dettagli cimitero
  const handleDettagliCimitero = async (nomeOrCodice: string) => {
    if (!nomeOrCodice) {
      return {
        message: "Potresti specificare il nome o il codice del cimitero che ti interessa?",
        data: null
      };
    }
    
    try {
      console.log(`Executing dettagli cimitero function for: ${nomeOrCodice}`);
      const cimitero = await fetchCimiteroDetails(nomeOrCodice);
      
      if (!cimitero) {
        return {
          message: `Non ho trovato informazioni sul cimitero "${nomeOrCodice}".`,
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
    } catch (error) {
      console.error("Error in handleDettagliCimitero:", error);
      throw error;
    }
  };

  // Funzione di test per AIFunctionTester
  const processTestQuery = async (func: AIFunction, query: string) => {
    try {
      const result = await executeAIFunction(func.id || 'test', func, query);
      return {
        text: JSON.stringify(result, null, 2),
        ...result
      };
    } catch (error) {
      console.error("Error in test query execution:", error);
      return {
        text: `Error: ${error.message}`,
        error: true
      };
    }
  };

  return {
    executeAIFunction,
    processTestQuery
  };
};
