
/**
 * Utility functions for cemetery-related operations
 */

export const extractCimiteroName = (query: string): string | null => {
  const pattern = /cimitero\s+([a-zA-Z\s]+)/i;
  const match = query.match(pattern);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  return null;
};

export const isListaCimiteriQuery = (query: string): boolean => {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Trigger phrases più ampie per catturare più variazioni
  const listTriggers = [
    'mostra elenco dei cimiteri',
    'mostra lista cimiteri',
    'elenco cimiteri',
    'lista cimiteri',
    'vedi tutti i cimiteri',
    'mostra tutti i cimiteri',
    'elenca i cimiteri',
    'visualizza i cimiteri',
    'visualizza tutti i cimiteri',
    'visualizza elenco cimiteri',
    'tutti i cimiteri',
    'quali cimiteri',
    'quali sono i cimiteri',
    'voglio vedere i cimiteri',
    'fammi vedere i cimiteri',
    'cimiteri disponibili',
    'mostrami i cimiteri',
    'dammi la lista dei cimiteri',
    'cimiteri'
  ];
  
  // Pattern più generali per catturare frasi non esatte
  const generalPatterns = [
    /cimiteri.*elenco/i,
    /elenco.*cimiteri/i,
    /lista.*cimiteri/i,
    /cimiteri.*lista/i,
    /mostra.*cimiteri/i,
    /vedi.*cimiteri/i,
    /visualizza.*cimiteri/i,
    /cimiteri.*disponibili/i,
    /quali.*cimiteri/i
  ];
  
  // Verifica le frasi trigger esatte
  for (const trigger of listTriggers) {
    if (normalizedQuery.includes(trigger)) {
      return true;
    }
  }
  
  // Verifica i pattern generali
  for (const pattern of generalPatterns) {
    if (pattern.test(normalizedQuery)) {
      return true;
    }
  }
  
  // Gestione del caso speciale: se la query è solo "cimiteri" o simile
  if (normalizedQuery === 'cimiteri' || 
      normalizedQuery === 'i cimiteri' ||
      normalizedQuery === 'vedere cimiteri' ||
      normalizedQuery === 'vedi cimiteri') {
    return true;
  }
  
  return false;
};

// Aggiungiamo una funzione per debug che ci permette di verificare
// se una query viene riconosciuta e quale trigger ha fatto match
export const debugListaCimiteriMatch = (query: string): { 
  isMatch: boolean;
  matchedTrigger?: string;
  matchedPattern?: string;
} => {
  const normalizedQuery = query.toLowerCase().trim();
  
  const listTriggers = [
    'mostra elenco dei cimiteri',
    'mostra lista cimiteri',
    'elenco cimiteri',
    'lista cimiteri',
    'vedi tutti i cimiteri',
    'mostra tutti i cimiteri',
    'elenca i cimiteri',
    'visualizza i cimiteri',
    'visualizza tutti i cimiteri',
    'visualizza elenco cimiteri',
    'tutti i cimiteri',
    'quali cimiteri',
    'quali sono i cimiteri',
    'voglio vedere i cimiteri',
    'fammi vedere i cimiteri',
    'cimiteri disponibili',
    'mostrami i cimiteri',
    'dammi la lista dei cimiteri',
    'cimiteri'
  ];
  
  // Verifica le frasi trigger esatte
  for (const trigger of listTriggers) {
    if (normalizedQuery.includes(trigger)) {
      return { isMatch: true, matchedTrigger: trigger };
    }
  }
  
  const generalPatterns = [
    /cimiteri.*elenco/i,
    /elenco.*cimiteri/i,
    /lista.*cimiteri/i,
    /cimiteri.*lista/i,
    /mostra.*cimiteri/i,
    /vedi.*cimiteri/i,
    /visualizza.*cimiteri/i,
    /cimiteri.*disponibili/i,
    /quali.*cimiteri/i
  ];
  
  // Verifica i pattern generali
  for (let i = 0; i < generalPatterns.length; i++) {
    if (generalPatterns[i].test(normalizedQuery)) {
      return { isMatch: true, matchedPattern: generalPatterns[i].toString() };
    }
  }
  
  // Gestione del caso speciale
  if (normalizedQuery === 'cimiteri' || 
      normalizedQuery === 'i cimiteri' ||
      normalizedQuery === 'vedere cimiteri' ||
      normalizedQuery === 'vedi cimiteri') {
    return { isMatch: true, matchedTrigger: normalizedQuery };
  }
  
  return { isMatch: false };
};
