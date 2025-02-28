
import { isAIFunctionTrigger } from "./isAIFunctionTrigger";

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
