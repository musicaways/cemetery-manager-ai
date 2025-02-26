
interface AIFunction {
  name: string;
  trigger_phrases: string[];
  code: string;
}

export const useAIFunctionMatcher = () => {
  const findMatchingFunction = (normalizedQuery: string, aiFunctions: AIFunction[]) => {
    console.log("\n=== INIZIO RICERCA FUNZIONE ===");
    console.log("Query utente:", normalizedQuery);
    console.log("Numero di funzioni attive:", aiFunctions.length);
    console.log("Funzioni disponibili:", aiFunctions.map(f => ({
      nome: f.name,
      frasi_trigger: f.trigger_phrases
    })));
    
    // Per ogni funzione, cerchiamo una corrispondenza esatta con le sue frasi trigger
    for (const func of aiFunctions) {
      console.log(`\nControllo funzione: ${func.name}`);
      console.log("Frasi trigger disponibili:", func.trigger_phrases);
      
      // Cerca una corrispondenza esatta tra la query e una delle frasi trigger
      const matchingPhrase = func.trigger_phrases.find(phrase => {
        const normalizedPhrase = phrase.toLowerCase().trim();
        const isExactMatch = normalizedQuery === normalizedPhrase;
        
        console.log(`Confronto:`);
        console.log(`- Frase trigger: "${normalizedPhrase}"`);
        console.log(`- Query utente: "${normalizedQuery}"`);
        console.log(`- Corrispondenza esatta? ${isExactMatch ? "SÌ" : "NO"}`);
        
        return isExactMatch;
      });

      if (matchingPhrase) {
        console.log(`\n✅ Trovata corrispondenza esatta!`);
        console.log(`- Funzione: ${func.name}`);
        console.log(`- Frase trigger: "${matchingPhrase}"`);
        console.log("=== FINE RICERCA FUNZIONE ===\n");
        return func;
      }
    }

    console.log("\n❌ Nessuna corrispondenza esatta trovata");
    console.log("=== FINE RICERCA FUNZIONE ===\n");
    return null;
  };

  return { findMatchingFunction };
};
