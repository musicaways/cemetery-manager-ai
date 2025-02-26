
interface AIFunction {
  name: string;
  trigger_phrases: string[];
  code: string;
}

export const useAIFunctionMatcher = () => {
  const findMatchingFunction = (normalizedQuery: string, aiFunctions: AIFunction[]) => {
    console.log("\n=== INIZIO RICERCA FUNZIONE ===");
    console.log("Query utente:", normalizedQuery);
    
    // Prima troviamo tutte le possibili corrispondenze
    const matches = aiFunctions.map(func => {
      // Trova la frase trigger più lunga che corrisponde
      const matchingPhrases = func.trigger_phrases
        .map(phrase => ({
          phrase: phrase.toLowerCase().trim(),
          length: phrase.length,
          matches: normalizedQuery.includes(phrase.toLowerCase().trim())
        }))
        .filter(p => p.matches)
        .sort((a, b) => b.length - a.length);

      if (matchingPhrases.length > 0) {
        return {
          function: func,
          bestMatch: matchingPhrases[0],
          maxPhraseLength: Math.max(...func.trigger_phrases.map(p => p.length))
        };
      }
      return null;
    }).filter(m => m !== null);

    console.log("\nMatch trovati:", matches.map(m => ({
      funzione: m?.function.name,
      fraseTrigger: m?.bestMatch.phrase,
      lunghezza: m?.bestMatch.length
    })));

    if (matches.length === 0) {
      console.log("\n❌ Nessuna funzione corrispondente trovata");
      console.log("=== FINE RICERCA FUNZIONE ===\n");
      return null;
    }

    // Ordina i match per:
    // 1. Lunghezza della frase trigger corrispondente (più lunga = più specifica)
    // 2. Lunghezza massima delle frasi trigger della funzione (per dare priorità alle funzioni più specifiche)
    const bestMatch = matches.sort((a, b) => {
      // Prima confronta la lunghezza della frase trigger corrispondente
      const lengthDiff = (b?.bestMatch.length || 0) - (a?.bestMatch.length || 0);
      if (lengthDiff !== 0) return lengthDiff;
      
      // Se sono uguali, confronta la lunghezza massima delle frasi trigger
      return (b?.maxPhraseLength || 0) - (a?.maxPhraseLength || 0);
    })[0];

    console.log("\n✅ Miglior match trovato:");
    console.log(`- Funzione: ${bestMatch?.function.name}`);
    console.log(`- Frase trigger: "${bestMatch?.bestMatch.phrase}"`);
    console.log(`- Lunghezza frase: ${bestMatch?.bestMatch.length}`);
    console.log("=== FINE RICERCA FUNZIONE ===\n");

    return bestMatch?.function || null;
  };

  return { findMatchingFunction };
};
