
import { isAIFunctionTrigger } from "./isAIFunctionTrigger";
import type { AIFunction } from "@/components/admin/ai-functions/types";

// Funzioni di matching dei trigger
export const findMatchingFunction = (query: string, functions: AIFunction[]): AIFunction | null => {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Controlla prima i match diretti, poi quelli parziali
  for (const func of functions) {
    if (!func.trigger_phrases || func.trigger_phrases.length === 0) continue;
    
    // Match esatto
    if (exactMatchTriggerPhrases(normalizedQuery, func.trigger_phrases)) {
      return func;
    }
  }
  
  // Se non ci sono match esatti, cerca match parziali
  let bestMatch: { func: AIFunction | null; score: number } = { func: null, score: 0 };
  
  for (const func of functions) {
    if (!func.trigger_phrases || func.trigger_phrases.length === 0) continue;
    
    const match = matchTriggerPhrases(normalizedQuery, func.trigger_phrases);
    if (match.matched && match.score > bestMatch.score) {
      bestMatch = { func, score: match.score };
    }
  }
  
  return bestMatch.func;
};

// Verifica match esatto tra query e frasi trigger
export const exactMatchTriggerPhrases = (query: string, phrases: string[]): boolean => {
  const normalizedQuery = query.toLowerCase().trim();
  const normalizedPhrases = phrases.map(p => p.toLowerCase().trim());
  
  return normalizedPhrases.some(phrase => normalizedQuery.includes(phrase));
};

// Verifica match parziale con score
export const matchTriggerPhrases = (query: string, phrases: string[]): { matched: boolean; score: number; matchedPhrase?: string } => {
  const normalizedQuery = query.toLowerCase().trim();
  const words = normalizedQuery.split(/\s+/);
  
  let bestMatch = { matched: false, score: 0, matchedPhrase: "" };
  
  for (const phrase of phrases) {
    const normalizedPhrase = phrase.toLowerCase().trim();
    const phraseWords = normalizedPhrase.split(/\s+/);
    
    // Calcola quante parole della frase sono nella query
    let matchedWords = 0;
    for (const word of phraseWords) {
      if (words.includes(word)) matchedWords++;
    }
    
    if (matchedWords > 0) {
      const score = matchedWords / phraseWords.length;
      if (score > bestMatch.score) {
        bestMatch = { matched: true, score, matchedPhrase: phrase };
      }
    }
  }
  
  return bestMatch;
};

// Trigger per i cimiteri
export const triggerShowCimitero = (query: string): { isMatch: boolean; matchedName: string } => {
  const cimiteroTriggerWords = [
    "mostrami il cimitero",
    "mostra il cimitero",
    "mostrami cimitero",
    "mostra cimitero",
    "apri il cimitero",
    "apri cimitero",
    "dettagli cimitero",
    "informazioni cimitero",
    "mostra informazioni cimitero",
    "mostra informazioni sul cimitero",
    "mostra informazioni del cimitero",
    "voglio vedere il cimitero",
    "fammi vedere il cimitero",
    "visualizza cimitero",
    "visualizza il cimitero"
  ];

  const normalizedQuery = query.toLowerCase().trim();
  
  // Check con AIFunction prima
  const functionMatch = isAIFunctionTrigger({
    query: normalizedQuery,
    triggerName: "Mostra dettagli cimitero"
  });
  
  if (functionMatch.isMatch) {
    console.log("Corrispondenza funzione AI per cimitero:", functionMatch);
    // Estraiamo il nome del cimitero dal testo dopo la parola "cimitero"
    const afterCimitero = normalizedQuery.match(/cimitero\s+(.+)/i);
    const cimiteroName = afterCimitero ? afterCimitero[1].trim() : '';
    
    return {
      isMatch: true,
      matchedName: cimiteroName
    };
  }
  
  // Se la funzione AI non ha fatto match, controlliamo i trigger manuali
  let matchFound = false;
  let matchedName = '';
  
  for (const trigger of cimiteroTriggerWords) {
    if (normalizedQuery.includes(trigger)) {
      matchFound = true;
      // Estrai il nome del cimitero dal testo dopo il trigger
      const afterTrigger = normalizedQuery.substring(normalizedQuery.indexOf(trigger) + trigger.length).trim();
      matchedName = afterTrigger;
      break;
    }
  }
  
  return {
    isMatch: matchFound,
    matchedName: matchedName
  };
};

export const triggerListCimiteri = (query: string): { isMatch: boolean; matchedTrigger: string | null } => {
  const listTriggerWords = [
    "mostrami tutti i cimiteri",
    "mostrami la lista dei cimiteri",
    "mostrami la lista di tutti i cimiteri", 
    "mostra tutti i cimiteri",
    "mostra la lista dei cimiteri",
    "mostra la lista di tutti i cimiteri",
    "visualizza i cimiteri",
    "visualizza tutti i cimiteri",
    "fammi vedere i cimiteri", 
    "fammi vedere tutti i cimiteri",
    "vedi i cimiteri",
    "vedi tutti i cimiteri",
    "lista dei cimiteri",
    "lista di tutti i cimiteri",
    "elenco dei cimiteri", 
    "elenco di tutti i cimiteri",
    "elenco cimiteri"
  ];

  const normalizedQuery = query.toLowerCase().trim();
  
  // Check con AIFunction prima
  const functionMatch = isAIFunctionTrigger({
    query: normalizedQuery,
    triggerName: "Lista Cimiteri"
  });
  
  if (functionMatch.isMatch) {
    console.log("Match trovato per lista cimiteri:", functionMatch);
    return {
      isMatch: true,
      matchedTrigger: "elenco cimiteri"
    };
  }
  
  // Poi controlliamo i trigger manuali
  for (const trigger of listTriggerWords) {
    if (normalizedQuery.includes(trigger)) {
      console.log("Match trovato per lista cimiteri:", trigger);
      return {
        isMatch: true,
        matchedTrigger: trigger
      };
    }
  }
  
  return {
    isMatch: false,
    matchedTrigger: null
  };
};
