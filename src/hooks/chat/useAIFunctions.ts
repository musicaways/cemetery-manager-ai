
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AIFunction } from "@/components/admin/ai-functions/types";

export const useAIFunctions = () => {
  const [functions, setFunctions] = useState<AIFunction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadFunctions();
  }, []);

  const loadFunctions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_functions')
        .select('*')
        .eq('active', true);

      if (error) throw error;
      setFunctions(data);
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

  const findMatchingFunction = (query: string, functions: AIFunction[]) => {
    const normalizedQuery = query.toLowerCase().trim();
    let bestMatch = { function: null, score: 0, matchedPhrase: "" };

    functions.forEach(func => {
      if (!func.trigger_phrases) return;
      
      const triggerPhrases = func.trigger_phrases.split(',').map(p => p.trim().toLowerCase());
      
      triggerPhrases.forEach(phrase => {
        if (normalizedQuery.includes(phrase)) {
          const score = phrase.length / normalizedQuery.length;
          if (score > bestMatch.score) {
            bestMatch = { function: func, score, matchedPhrase: phrase };
          }
        }
      });
    });

    return bestMatch;
  };

  const matchTriggerPhrases = (normalizedQuery: string, triggerPhrases: string[]): boolean => {
    return triggerPhrases.some(phrase => normalizedQuery.includes(phrase.toLowerCase()));
  };
  
  const executeAIFunction = async (functionId: string, query: string) => {
    const func = functions.find(f => f.id === functionId);
    if (!func) {
      throw new Error("Funzione non trovata");
    }

    try {
      // Qui dovrebbe essere chiamata la funzione effettiva
      // Per ora simuliamo una risposta
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        message: `Funzione ${func.name} eseguita con successo. [Simulazione]`,
        data: { functionResult: true, functionName: func.name }
      };
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

  const identifyFunctions = async (query: string) => {
    const normalizedQuery = query.toLowerCase().trim();
    const activeFunctions = await getActiveFunctions();
    
    for (const func of activeFunctions) {
      if (!func.trigger_phrases) continue;
      
      const triggerPhrases = func.trigger_phrases.split(',').map(p => p.trim().toLowerCase());
      
      if (matchTriggerPhrases(normalizedQuery, triggerPhrases)) {
        return func.id;
      }
    }
    
    return null;
  };

  return {
    getActiveFunctions,
    findMatchingFunction,
    processTestQuery,
    matchTriggerPhrases,
    executeAIFunction,
    identifyFunctions
  };
};
