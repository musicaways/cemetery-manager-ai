
import { supabase } from "@/integrations/supabase/client";
import type { AIFunction } from "@/components/admin/ai-functions/types";
import type { AIResponse } from "@/utils/types";

export const useAIFunctions = () => {
  // Recupera solo le funzioni attive
  const getActiveFunctions = async () => {
    const { data, error } = await supabase
      .from('ai_chat_functions')
      .select('*')
      .eq('is_active', true);
    
    if (error) {
      console.error("Errore nel recupero funzioni AI:", error);
      throw error;
    }
    return data as AIFunction[];
  };

  // Trova una funzione che ha un match ESATTO con una delle sue frasi trigger
  const findExactMatchingFunction = (query: string, functions: AIFunction[]) => {
    const normalizedQuery = query.toLowerCase().trim();
    console.log("Query normalizzata:", normalizedQuery);
    
    for (const func of functions) {
      // Normalizza tutte le frasi trigger
      const normalizedTriggers = func.trigger_phrases.map(phrase => 
        phrase.toLowerCase().trim()
      );
      
      console.log("Confronto con i trigger della funzione:", func.name, normalizedTriggers);
      
      // Cerca un match ESATTO
      if (normalizedTriggers.includes(normalizedQuery)) {
        console.log("Match esatto trovato per la funzione:", func.name);
        return func;
      }
    }
    
    console.log("Nessun match esatto trovato");
    return null;
  };

  const processTestQuery = async (aiProvider: string, aiModel: string): Promise<AIResponse> => {
    return {
      text: `Test con provider: ${aiProvider}, modello: ${aiModel}`,
      data: null
    };
  };

  return {
    getActiveFunctions,
    findMatchingFunction: findExactMatchingFunction,
    processTestQuery
  };
};
