
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
    
    // Trova la migliore corrispondenza tra tutte le funzioni
    let bestMatchFunction = null;
    let bestMatchScore = MATCHING_THRESHOLD;
    let bestMatchedPhrase = '';
    
    // Verifica ogni funzione e calcola il punteggio di corrispondenza
    for (const func of functions) {
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
    matchTriggerPhrases // Esportiamo anche questa per i test nell'interfaccia di amministrazione
  };
};
