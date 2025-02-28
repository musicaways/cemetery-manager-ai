
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
