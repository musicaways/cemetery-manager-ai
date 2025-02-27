
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
        .from('ai_chat_functions')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      
      // Cast the data to AIFunction[] to ensure type compatibility
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

  const findMatchingFunction = (query: string, functions: AIFunction[]) => {
    const normalizedQuery = query.toLowerCase().trim();
    let bestMatch = { function: null, score: 0, matchedPhrase: "" };

    functions.forEach(func => {
      if (!func.trigger_phrases) return;
      
      // Ensure trigger_phrases is treated as an array
      const phrases = func.trigger_phrases.map(p => p.trim().toLowerCase());
      
      phrases.forEach(phrase => {
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

  // Add the exactMatchTriggerPhrases function
  const exactMatchTriggerPhrases = (normalizedQuery: string, triggerPhrases: string[]): boolean => {
    return triggerPhrases.some(phrase => normalizedQuery === phrase.trim().toLowerCase());
  };

  const matchTriggerPhrases = (normalizedQuery: string, triggerPhrases: string[]): { matched: boolean; score: number; matchedPhrase?: string } => {
    let bestMatch = { matched: false, score: 0, matchedPhrase: undefined as string | undefined };
    
    triggerPhrases.forEach(phrase => {
      const normalizedPhrase = phrase.trim().toLowerCase();
      if (normalizedQuery.includes(normalizedPhrase)) {
        const score = normalizedPhrase.length / normalizedQuery.length;
        if (score > bestMatch.score) {
          bestMatch = { matched: true, score, matchedPhrase: normalizedPhrase };
        }
      }
    });
    
    return bestMatch;
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
      
      // Ensure trigger_phrases is treated as an array
      const phrases = func.trigger_phrases.map(p => p.trim().toLowerCase());
      
      if (phrases.some(phrase => normalizedQuery.includes(phrase))) {
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
    exactMatchTriggerPhrases,
    executeAIFunction,
    identifyFunctions
  };
};
