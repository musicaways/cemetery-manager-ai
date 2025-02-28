
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AIFunction } from "@/components/admin/ai-functions/types";
import { findMatchingFunction, matchTriggerPhrases, exactMatchTriggerPhrases } from "./utils/triggerUtils";
import { isListaCimiteriQuery } from "./utils/cimiteriUtils";
import { useAIFunctionExecution } from "./useAIFunctionExecution";

export const useAIFunctions = () => {
  const [functions, setFunctions] = useState<AIFunction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { executeAIFunction, processTestQuery } = useAIFunctionExecution();

  useEffect(() => {
    loadFunctions();
  }, []);

  const loadFunctions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_chat_functions')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      
      console.log("Funzioni AI caricate:", data?.length || 0);
      setFunctions(data as unknown as AIFunction[]);
    } catch (error) {
      console.error('Errore nel caricamento delle funzioni AI:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActiveFunctions = async (): Promise<AIFunction[]> => {
    if (functions.length === 0) {
      await loadFunctions();
    }
    return functions;
  };
  
  const identifyFunctions = async (query: string) => {
    const normalizedQuery = query.toLowerCase().trim();
    const activeFunctions = await getActiveFunctions();
    
    console.log("Identificazione funzioni per query:", normalizedQuery);
    console.log("Funzioni attive disponibili:", activeFunctions.length);
    
    // Controllo specifico per la funzione lista cimiteri
    if (isListaCimiteriQuery(normalizedQuery)) {
      console.log("Query identificata come lista cimiteri");
      const listFunction = activeFunctions.find(f => 
        (f.name.toLowerCase().includes("elenco cimiteri") || 
        f.name.toLowerCase().includes("lista cimiteri"))
      );
      
      if (listFunction) {
        console.log("Trovata funzione lista cimiteri:", listFunction.id);
        return listFunction.id;
      } else {
        console.log("Nessuna funzione lista cimiteri trovata tra le funzioni attive");
      }
    }
    
    // Controllo generale per altre funzioni
    for (const func of activeFunctions) {
      if (!func.trigger_phrases) continue;
      
      const phrases = func.trigger_phrases.map(p => p.trim().toLowerCase());
      console.log(`Controllo trigger phrases per ${func.name}:`, phrases);
      
      if (phrases.some(phrase => normalizedQuery.includes(phrase))) {
        console.log(`Trovata corrispondenza per la funzione ${func.name} con trigger phrase`);
        return func.id;
      }
    }
    
    console.log("Nessuna funzione trovata per la query");
    return null;
  };

  // Wrapper per executeAIFunction che recupera la funzione dal suo ID
  const executeFunctionById = async (functionId: string, query: string) => {
    const func = functions.find(f => f.id === functionId);
    if (!func) {
      console.error("Funzione non trovata con ID:", functionId);
      throw new Error("Funzione non trovata");
    }
    console.log("Esecuzione funzione:", func.name);
    return executeAIFunction(functionId, func, query);
  };

  return {
    getActiveFunctions,
    findMatchingFunction,
    processTestQuery,
    matchTriggerPhrases,
    exactMatchTriggerPhrases,
    executeAIFunction: executeFunctionById,
    identifyFunctions
  };
};
