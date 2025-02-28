
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
    
    // Controllo specifico per la funzione lista cimiteri
    if (isListaCimiteriQuery(normalizedQuery)) {
      const listFunction = activeFunctions.find(f => 
        f.name.toLowerCase().includes("elenco cimiteri") || 
        f.name.toLowerCase().includes("lista cimiteri")
      );
      if (listFunction) return listFunction.id;
    }
    
    // Controllo generale per altre funzioni
    for (const func of activeFunctions) {
      if (!func.trigger_phrases) continue;
      
      const phrases = func.trigger_phrases.map(p => p.trim().toLowerCase());
      
      if (phrases.some(phrase => normalizedQuery.includes(phrase))) {
        return func.id;
      }
    }
    
    return null;
  };

  // Wrapper per executeAIFunction che recupera la funzione dal suo ID
  const executeFunctionById = async (functionId: string, query: string) => {
    const func = functions.find(f => f.id === functionId);
    if (!func) {
      throw new Error("Funzione non trovata");
    }
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
