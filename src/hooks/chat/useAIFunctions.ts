
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

  // Funzione helper per escape di caratteri speciali nelle regex
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // Funzione per il matching esatto delle frasi trigger
  const exactMatchTriggerPhrases = (
    normalizedQuery: string,
    triggerPhrases: string[]
  ): boolean => {
    // Normalizza la query (rimuovi spazi extra all'inizio/fine e converti in minuscolo)
    const cleanedQuery = normalizedQuery.toLowerCase().trim();
    
    // Normalizza tutte le frasi trigger
    const normalizedTriggerPhrases = triggerPhrases.map(phrase => 
      phrase.toLowerCase().trim()
    );
    
    // Verifica se la query corrisponde ESATTAMENTE a una delle frasi trigger
    return normalizedTriggerPhrases.includes(cleanedQuery);
  };

  // Funzione di logging per debugging
  const logFunctionMatching = (
    query: string,
    functionName: string,
    triggerPhrases: string[],
    matched: boolean,
    matchType: string
  ) => {
    console.log(`Query: "${query}"`);
    console.log(`Function: "${functionName}"`);
    console.log(`Match type: ${matchType}`);
    console.log(`Matched: ${matched}`);
    if (matched) {
      console.log('Matched trigger phrases:');
      triggerPhrases.forEach(phrase => {
        if (query.toLowerCase().trim() === phrase.toLowerCase().trim()) {
          console.log(`- "${phrase}" (EXACT MATCH)`);
        }
      });
    }
    console.log('-------------------');
  };

  // Algoritmo migliorato per il matching delle frasi trigger
  const matchTriggerPhrases = (
    normalizedQuery: string,
    triggerPhrases: string[]
  ): { matched: boolean; score: number; matchedPhrase?: string } => {
    // Inizializza con nessuna corrispondenza
    let bestMatch = { matched: false, score: 0, matchedPhrase: undefined as string | undefined };
    
    // Controlla ogni frase trigger
    for (const phrase of triggerPhrases) {
      // Normalizza la frase trigger nello stesso modo della query
      const normalizedPhrase = phrase.toLowerCase().trim();
      
      // Verifica match esatto (frase completa)
      if (normalizedQuery === normalizedPhrase) {
        return { matched: true, score: 1.0, matchedPhrase: phrase };
      }
      
      // Verifica se la query inizia con la frase trigger
      if (normalizedQuery.startsWith(normalizedPhrase + " ")) {
        const score = 0.9 * (normalizedPhrase.length / normalizedQuery.length);
        if (score > bestMatch.score) {
          bestMatch = { matched: true, score, matchedPhrase: phrase };
        }
      }
      
      // Verifica se la query contiene la frase trigger come parola completa
      const wordBoundaryPattern = new RegExp(`\\b${escapeRegExp(normalizedPhrase)}\\b`, 'i');
      if (wordBoundaryPattern.test(normalizedQuery)) {
        const score = 0.8 * (normalizedPhrase.length / normalizedQuery.length);
        if (score > bestMatch.score) {
          bestMatch = { matched: true, score, matchedPhrase: phrase };
        }
      }
    }
    
    return bestMatch;
  };

  const findMatchingFunction = (query: string, functions: AIFunction[]) => {
    // Normalizza la query ricevuta
    const normalizedQuery = query.toLowerCase().trim();
    
    // Soglia minima per considerare una corrispondenza valida
    const MATCHING_THRESHOLD = 0.5;
    
    // Cerca prima una corrispondenza esatta per la funzione "Lista cimiteri"
    const listaCimiteriFunction = functions.find(func => 
      func.name.toLowerCase() === "lista cimiteri" || 
      func.name.toLowerCase() === "lista dei cimiteri"
    );
    
    if (listaCimiteriFunction) {
      const isExactMatch = exactMatchTriggerPhrases(normalizedQuery, listaCimiteriFunction.trigger_phrases);
      
      // Log per debugging
      logFunctionMatching(
        normalizedQuery, 
        listaCimiteriFunction.name, 
        listaCimiteriFunction.trigger_phrases, 
        isExactMatch,
        "Exact Match"
      );
      
      if (isExactMatch) {
        return { 
          function: listaCimiteriFunction, 
          score: 1.0,
          matchedPhrase: normalizedQuery
        };
      }
    }
    
    // Se non c'è un match esatto per la lista cimiteri, prosegui con l'algoritmo standard
    // Trova la migliore corrispondenza tra tutte le funzioni
    let bestMatchFunction = null;
    let bestMatchScore = MATCHING_THRESHOLD;
    let bestMatchedPhrase = '';
    
    // Verifica ogni funzione e calcola il punteggio di corrispondenza
    for (const func of functions) {
      // Saltiamo la funzione "Lista cimiteri" perché l'abbiamo già verificata
      if (func.name.toLowerCase() === "lista cimiteri" || 
          func.name.toLowerCase() === "lista dei cimiteri") {
        continue;
      }
      
      const { matched, score, matchedPhrase } = matchTriggerPhrases(normalizedQuery, func.trigger_phrases);
      
      // Logga per debug
      console.log(`Function: ${func.name}, Matched: ${matched}, Score: ${score}, Phrase: ${matchedPhrase}`);
      
      if (matched && score > bestMatchScore) {
        bestMatchFunction = func;
        bestMatchScore = score;
        bestMatchedPhrase = matchedPhrase || '';
      }
    }
    
    // Se abbiamo trovato una corrispondenza valida che supera la soglia
    if (bestMatchFunction) {
      console.log(`Selected function: ${bestMatchFunction.name} with score ${bestMatchScore} (phrase: ${bestMatchedPhrase})`);
      return { 
        function: bestMatchFunction, 
        score: bestMatchScore,
        matchedPhrase: bestMatchedPhrase
      };
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
    processTestQuery,
    matchTriggerPhrases, // Esportiamo anche questa per i test nell'interfaccia di amministrazione
    exactMatchTriggerPhrases // Esportiamo anche questa per i test nell'interfaccia di amministrazione
  };
};
