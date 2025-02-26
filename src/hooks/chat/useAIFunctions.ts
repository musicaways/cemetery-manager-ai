
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
    const { data: aiFunctions, error } = await supabase
      .from('ai_chat_functions')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    return aiFunctions;
  };

  const findMatchingFunction = (normalizedQuery: string, aiFunctions: any[]) => {
    console.log("Controllo funzioni AI per query:", normalizedQuery);
    console.log("Funzioni disponibili:", aiFunctions);
    
    const matchedFunction = aiFunctions.find(func => 
      func.trigger_phrases.some((phrase: string) => {
        const matches = normalizedQuery.includes(phrase.toLowerCase());
        console.log(`Confronto "${phrase.toLowerCase()}" con "${normalizedQuery}":`, matches);
        return matches;
      })
    );

    if (matchedFunction) {
      console.log("Funzione trovata:", matchedFunction);
    } else {
      console.log("Nessuna funzione trovata per la query");
    }

    return matchedFunction;
  };

  const executeFunction = async (func: any, query: string) => {
    try {
      // Esegue il codice della funzione in modo sicuro
      const functionBody = func.code;
      console.log("Esecuzione funzione:", func.name);
      console.log("Codice funzione:", functionBody);
      
      // Crea una funzione dalla stringa del codice
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const executableFunction = new AsyncFunction('supabase', 'query', functionBody);
      
      // Estrai il nome del cimitero dalla query
      const matches = query.match(/cimitero\s+(?:di\s+)?(.+)/i);
      const cimiteroName = matches ? matches[1] : query;
      
      // Esegue la funzione passando l'istanza di supabase e il nome del cimitero
      const result = await executableFunction(supabase, cimiteroName);
      console.log("Risultato funzione:", result);
      
      if (result === undefined || result === null) {
        return {
          text: "Nessun risultato trovato",
          data: null
        };
      }
      
      // Se il risultato è una stringa, lo convertiamo in un oggetto
      if (typeof result === 'string') {
        return {
          text: result,
          data: null
        };
      }
      
      return result;
    } catch (error) {
      console.error("Errore nell'esecuzione della funzione:", error);
      throw error;
    }
  };

  return {
    processTestQuery,
    getActiveFunctions,
    findMatchingFunction,
    executeFunction
  };
};
