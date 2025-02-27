
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
  
  const extractCimiteroName = (query: string): string | null => {
    const pattern = /cimitero\s+([a-zA-Z\s]+)/i;
    const match = query.match(pattern);
    
    if (match && match[1]) {
      return match[1].trim();
    }
    
    return null;
  };

  const isListaCimiteriQuery = (query: string): boolean => {
    const normalizedQuery = query.toLowerCase().trim();
    const listTriggers = [
      'mostra elenco dei cimiteri',
      'mostra lista cimiteri',
      'elenco cimiteri',
      'lista cimiteri',
      'vedi tutti i cimiteri',
      'mostra tutti i cimiteri'
    ];
    
    return listTriggers.some(trigger => normalizedQuery.includes(trigger));
  };
  
  const executeAIFunction = async (functionId: string, query: string) => {
    const func = functions.find(f => f.id === functionId);
    if (!func) {
      throw new Error("Funzione non trovata");
    }

    try {
      // Identifica prima se è una richiesta di lista cimiteri
      if (isListaCimiteriQuery(query) || func.name.toLowerCase().includes("elenco cimiteri")) {
        console.log("Esecuzione funzione lista cimiteri");
        const { data: cimiteri, error } = await supabase
          .from('Cimitero')
          .select('*')
          .order('Descrizione');
          
        if (error) throw error;
        
        if (cimiteri && cimiteri.length > 0) {
          return {
            message: "Ecco l'elenco di tutti i cimiteri disponibili:",
            data: { 
              type: "cimiteri",
              cimiteri: cimiteri
            }
          };
        } else {
          return {
            message: "Non ho trovato cimiteri nel database.",
            data: { type: "generic_response" }
          };
        }
      } 
      // Gestione dettagli singolo cimitero
      else if (func.name.toLowerCase().includes("dettagli cimitero")) {
        const nomeCimitero = extractCimiteroName(query);
        
        if (!nomeCimitero) {
          return {
            message: "Per favore specifica il nome del cimitero che desideri visualizzare.",
            data: { type: "generic_response" }
          };
        }
        
        const { data: cimiteri, error } = await supabase
          .from('Cimitero')
          .select('*')
          .ilike('Descrizione', `%${nomeCimitero}%`)
          .limit(1);
        
        if (error) throw error;
        
        if (cimiteri && cimiteri.length > 0) {
          return {
            message: `Ecco le informazioni sul Cimitero ${cimiteri[0].Descrizione}`,
            data: { 
              type: "cimitero",
              cimitero: cimiteri[0]
            }
          };
        } else {
          return {
            message: `Non ho trovato informazioni sul cimitero "${nomeCimitero}". Posso aiutarti con qualcos'altro?`,
            data: { type: "generic_response" }
          };
        }
      } else {
        return {
          message: `Non ho capito quale funzione eseguire. Puoi riprovare con una richiesta più chiara?`,
          data: { type: "generic_response" }
        };
      }
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
