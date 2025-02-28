
/**
 * Utility functions for cemetery-related operations
 */

export const extractCimiteroName = (query: string): string | null => {
  console.log("Estrazione nome cimitero da:", query);
  // Riconosce sia "cimitero di Milano" che "cimitero Milano"
  const pattern = /cimitero\s+(?:di\s+)?([a-zA-Z\s]+)/i;
  const match = query.match(pattern);
  
  if (match && match[1]) {
    const nome = match[1].trim();
    console.log("Nome cimitero estratto:", nome);
    return nome;
  }
  
  console.log("Nessun nome cimitero trovato nella query");
  return null;
};

export const isListaCimiteriQuery = (query: string): boolean => {
  const normalizedQuery = query.toLowerCase().trim();
  console.log("Controllo se è una query lista cimiteri:", normalizedQuery);
  
  const listTriggers = [
    'mostra elenco dei cimiteri',
    'mostra lista cimiteri',
    'elenco cimiteri',
    'lista cimiteri',
    'vedi tutti i cimiteri',
    'mostra tutti i cimiteri',
    'mostrami i cimiteri',
    'mostrami tutti i cimiteri',
    'visualizza i cimiteri',
    'visualizza tutti i cimiteri'
  ];
  
  const result = listTriggers.some(trigger => normalizedQuery.includes(trigger));
  console.log("Risultato controllo lista cimiteri:", result);
  return result;
};
