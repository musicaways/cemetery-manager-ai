
import { supabase } from "@/integrations/supabase/client";
import type { AIResponse, QueryRequest } from "@/utils/types";

export const useAIFunctions = () => {
  const processTestQuery = async (aiProvider: string, aiModel: string) => {
    try {
      const requestBody: QueryRequest = {
        query: "Chi sei?",
        queryType: 'test',
        aiProvider,
        aiModel,
        isTest: true
      };

      const { data, error } = await supabase.functions.invoke<AIResponse>('process-query', {
        body: requestBody
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Errore nel test:", error);
      throw error;
    }
  };

  const getActiveFunctions = async () => {
    try {
      const { data: aiFunctions, error } = await supabase
        .from('ai_chat_functions')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      console.log("Funzioni AI attive recuperate:", aiFunctions);
      return aiFunctions;
    } catch (error) {
      console.error("Errore nel recupero delle funzioni AI:", error);
      throw error;
    }
  };

  const findMatchingFunction = (normalizedQuery: string, aiFunctions: any[]) => {
    const matchedFunction = aiFunctions.find(func => 
      func.trigger_phrases.some((phrase: string) => 
        normalizedQuery.includes(phrase.toLowerCase())
      )
    );
    console.log("Funzione corrispondente trovata:", matchedFunction);
    return matchedFunction;
  };

  return {
    processTestQuery,
    getActiveFunctions,
    findMatchingFunction
  };
};
