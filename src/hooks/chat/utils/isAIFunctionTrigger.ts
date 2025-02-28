
interface TriggerCheckParams {
  query: string;
  triggerName: string;
  exactMatch?: boolean;
}

export function isAIFunctionTrigger({
  query,
  triggerName,
  exactMatch = false
}: TriggerCheckParams): { isMatch: boolean; debugInfo?: string } {
  // Normalizza la query
  const normalizedQuery = query.toLowerCase().trim();
  
  // Normalizza il nome trigger
  const normalizedTriggerName = triggerName.toLowerCase().trim();
  
  // Match esatto
  if (exactMatch) {
    return {
      isMatch: normalizedQuery === normalizedTriggerName,
      debugInfo: `Exact match: "${normalizedQuery}" === "${normalizedTriggerName}"`
    };
  }
  
  // Match parziale
  const isPartialMatch = normalizedQuery.includes(normalizedTriggerName);
  
  // Verifica per tipi specifici di funzioni
  if (normalizedTriggerName.includes("lista cimiteri") || 
      normalizedTriggerName.includes("elenco cimiteri")) {
    // Pattern comuni per la lista cimiteri
    const cimiteriPatterns = [
      /mostra(?:mi)?\s+(?:tutti\s+)?(?:i\s+)?cimiter[io]/i,
      /(?:lista|elenco)(?:\s+(?:dei|di|dei|di\s+tutti))?\s+(?:i\s+)?cimiter[io]/i,
      /visualizza(?:\s+(?:tutti))?\s+(?:i\s+)?cimiter[io]/i,
      /vedi(?:\s+(?:tutti))?\s+(?:i\s+)?cimiter[io]/i
    ];
    
    if (cimiteriPatterns.some(pattern => pattern.test(normalizedQuery))) {
      return {
        isMatch: true,
        debugInfo: `Lista cimiteri pattern match`
      };
    }
  }
  
  if (normalizedTriggerName.includes("dettagli cimitero")) {
    // Pattern per i dettagli di un cimitero specifico
    const dettagliPatterns = [
      /(?:mostra(?:mi)?|visualizza|vedi)\s+(?:il\s+)?cimitero\s+(?:di\s+)?(.+)/i,
      /(?:informazioni|dettagli)\s+(?:su(?:l)?\s+)?(?:il\s+)?cimitero\s+(?:di\s+)?(.+)/i,
      /cimitero\s+(?:di\s+)?(.+)/i
    ];
    
    if (dettagliPatterns.some(pattern => pattern.test(normalizedQuery))) {
      return {
        isMatch: true,
        debugInfo: `Dettagli cimitero pattern match`
      };
    }
  }
  
  // Default: match parziale
  return {
    isMatch: isPartialMatch,
    debugInfo: isPartialMatch ? 
      `Partial match: "${normalizedTriggerName}" in "${normalizedQuery}"` : 
      `No match found`
  };
}
