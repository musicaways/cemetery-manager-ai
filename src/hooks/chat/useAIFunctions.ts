
import { supabase } from "@/integrations/supabase/client";
import type { AIFunction } from "@/components/admin/ai-functions/types";
import type { AIResponse } from "@/utils/types";

export const useAIFunctions = () => {
  const getActiveFunctions = async () => {
    const { data, error } = await supabase
      .from('ai_chat_functions')
      .select('*')
      .eq('is_active', true);
    
    if (error) throw error;
    return data as AIFunction[];
  };

  const findMatchingFunction = (query: string, functions: AIFunction[]) => {
    // Normalizza la query ricevuta
    const normalizedQuery = query.toLowerCase().trim();
    
    // Cerca un match esatto tra le frasi trigger di ogni funzione
    for (const func of functions) {
      // Normalizza tutte le frasi trigger
      const normalizedTriggers = func.trigger_phrases.map(phrase => 
        phrase.toLowerCase().trim()
      );
      
      // Verifica se c'è un match esatto
      const hasExactMatch = normalizedTriggers.includes(normalizedQuery);
      
      if (hasExactMatch) {
        return func;
      }
    }
    
    return null;
  };

  const processTestQuery = async (aiProvider: string, aiModel: string): Promise<AIResponse> => {
    const response: AIResponse = {
      text: `Test con provider: ${aiProvider}, modello: ${aiModel}`,
      data: null
    };
    return response;
  };

  return {
    getActiveFunctions,
    findMatchingFunction,
    processTestQuery
  };
};
