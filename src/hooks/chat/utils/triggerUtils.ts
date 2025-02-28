
/**
 * Utility functions for handling AI function trigger phrases
 */

export const exactMatchTriggerPhrases = (normalizedQuery: string, triggerPhrases: string[]): boolean => {
  console.log("Controllo match esatto per:", normalizedQuery, "con frasi:", triggerPhrases);
  return triggerPhrases.some(phrase => normalizedQuery === phrase.trim().toLowerCase());
};

export const matchTriggerPhrases = (normalizedQuery: string, triggerPhrases: string[]): { matched: boolean; score: number; matchedPhrase?: string } => {
  console.log("Controllo match parziale per:", normalizedQuery);
  let bestMatch = { matched: false, score: 0, matchedPhrase: undefined as string | undefined };
  
  triggerPhrases.forEach(phrase => {
    const normalizedPhrase = phrase.trim().toLowerCase();
    if (normalizedQuery.includes(normalizedPhrase)) {
      const score = normalizedPhrase.length / normalizedQuery.length;
      console.log(`Match trovato: "${normalizedPhrase}" con score:`, score);
      if (score > bestMatch.score) {
        bestMatch = { matched: true, score, matchedPhrase: normalizedPhrase };
      }
    }
  });
  
  return bestMatch;
};

export const findMatchingFunction = (query: string, functions: any[]) => {
  const normalizedQuery = query.toLowerCase().trim();
  let bestMatch = { function: null, score: 0, matchedPhrase: "" };
  console.log("Ricerca funzione corrispondente per:", normalizedQuery);

  functions.forEach(func => {
    if (!func.trigger_phrases) return;
    
    const phrases = func.trigger_phrases.map((p: string) => p.trim().toLowerCase());
    console.log(`Controllo frasi trigger per ${func.name}:`, phrases);
    
    phrases.forEach(phrase => {
      if (normalizedQuery.includes(phrase)) {
        const score = phrase.length / normalizedQuery.length;
        console.log(`Match trovato con "${phrase}" per ${func.name}, score:`, score);
        if (score > bestMatch.score) {
          bestMatch = { function: func, score, matchedPhrase: phrase };
        }
      }
    });
  });

  return bestMatch;
};
