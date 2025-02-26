
interface AIFunction {
  name: string;
  trigger_phrases: string[];
  code: string;
}

export const useAIFunctionMatcher = () => {
  const findMatchingFunction = (normalizedQuery: string, aiFunctions: AIFunction[]) => {
    console.log("\n=== INIZIO RICERCA FUNZIONE ===");
    console.log("Query utente:", normalizedQuery);
    
    // Ordina le funzioni per dare priorità alle frasi trigger più lunghe
    const sortedFunctions = [...aiFunctions].sort((a, b) => {
      const maxLengthA = Math.max(...a.trigger_phrases.map(p => p.length));
      const maxLengthB = Math.max(...b.trigger_phrases.map(p => p.length));
      return maxLengthB - maxLengthA;
    });

    for (const func of sortedFunctions) {
      console.log(`\nAnalisi funzione: ${func.name}`);
      console.log("Frasi trigger disponibili:", func.trigger_phrases);

      for (const phrase of func.trigger_phrases) {
        const phraseNormalized = phrase.toLowerCase().trim();
        const isMatch = normalizedQuery.includes(phraseNormalized);
        
        console.log(`- Confronto frase trigger: "${phraseNormalized}"`);
        console.log(`- Contenuta nella query? ${isMatch ? "SÌ" : "NO"}`);
        
        if (isMatch) {
          console.log(`\n✅ Match trovato per la funzione "${func.name}" con la frase: "${phraseNormalized}"`);
          console.log("=== FINE RICERCA FUNZIONE ===\n");
          return func;
        }
      }
    }

    console.log("\n❌ Nessuna funzione corrispondente trovata");
    console.log("=== FINE RICERCA FUNZIONE ===\n");
    return null;
  };

  return { findMatchingFunction };
};
