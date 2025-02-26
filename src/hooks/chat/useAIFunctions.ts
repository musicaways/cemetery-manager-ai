
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
      console.log("Recupero funzioni AI attive...");
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
    console.log("Query normalizzata:", normalizedQuery);
    console.log("Funzioni disponibili:", aiFunctions);

    // Ordina le funzioni in base alla lunghezza della frase trigger più lunga
    // per dare priorità ai match più specifici
    const sortedFunctions = [...aiFunctions].sort((a, b) => {
      const maxLengthA = Math.max(...a.trigger_phrases.map((p: string) => p.length));
      const maxLengthB = Math.max(...b.trigger_phrases.map((p: string) => p.length));
      return maxLengthB - maxLengthA;
    });

    for (const func of sortedFunctions) {
      console.log(`Verifico funzione: ${func.name}`);
      console.log("Frasi trigger:", func.trigger_phrases);

      // Verifica se qualsiasi frase trigger è contenuta nella query
      const matchingPhrase = func.trigger_phrases.find((phrase: string) => {
        const phraseNormalized = phrase.toLowerCase().trim();
        const isMatch = normalizedQuery.includes(phraseNormalized);
        console.log(`Confronto: "${phraseNormalized}" con "${normalizedQuery}" -> ${isMatch}`);
        return isMatch;
      });

      if (matchingPhrase) {
        console.log(`Match trovato per la funzione ${func.name} con la frase: ${matchingPhrase}`);
        return func;
      }
    }

    console.log("Nessuna funzione corrispondente trovata");
    return null;
  };

  return {
    processTestQuery,
    getActiveFunctions,
    findMatchingFunction
  };
};
