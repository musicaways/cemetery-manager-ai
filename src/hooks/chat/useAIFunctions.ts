
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
    // Normalizza la query e rimuovi spazi extra
    const normalizedQuery = query.toLowerCase().trim().replace(/\s+/g, ' ');
    console.log("AI Functions - Query normalizzata:", normalizedQuery);
    
    for (const func of functions) {
      // Normalizza tutte le frasi trigger
      const normalizedTriggers = func.trigger_phrases.map(phrase => 
        phrase.toLowerCase().trim().replace(/\s+/g, ' ')
      );
      
      console.log(`AI Functions - Confronto triggers per ${func.name}:`, normalizedTriggers);
      
      // Verifica match ESATTO
      const hasExactMatch = normalizedTriggers.some(trigger => trigger === normalizedQuery);
      
      if (hasExactMatch) {
        console.log(`AI Functions - Match esatto trovato per ${func.name}`);
        return func;
      }
    }
    
    console.log("AI Functions - Nessun match esatto trovato");
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
