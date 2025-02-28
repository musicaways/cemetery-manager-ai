
import type { AIFunction } from "@/components/admin/ai-functions/types";

interface AIFunctionTriggerParams {
  query: string;
  triggerName: string;
}

/**
 * Controlla se una query corrisponde a un nome di funzione AI
 * @param params Parametri per il controllo del trigger
 * @returns Oggetto con informazioni sul match
 */
export const isAIFunctionTrigger = (params: AIFunctionTriggerParams): { isMatch: boolean; matchType?: string } => {
  const { query, triggerName } = params;
  
  // Normalizza i nomi per una corrispondenza più precisa
  const normalizedQuery = query.toLowerCase().trim();
  const normalizedTriggerName = triggerName.toLowerCase().trim();
  
  // Verifica se il testo contiene esattamente il nome del trigger
  if (normalizedQuery.includes(normalizedTriggerName)) {
    return {
      isMatch: true,
      matchType: 'exact'
    };
  }
  
  // Controlla anche trigger parziali o abbreviati
  // Lista cimiteri può essere attivato con "lista" o "elenco"
  if (normalizedTriggerName === "lista cimiteri" || 
      normalizedTriggerName === "elenco cimiteri") {
    if (normalizedQuery.includes("lista") && normalizedQuery.includes("cimiteri") ||
        normalizedQuery.includes("elenco") && normalizedQuery.includes("cimiteri") ||
        normalizedQuery.includes("cimiteri") && (
          normalizedQuery.includes("tutti") || 
          normalizedQuery.includes("mostra") || 
          normalizedQuery.includes("visualizza")
        )) {
      return {
        isMatch: true,
        matchType: 'partial'
      };
    }
  }
  
  // Trigger per i dettagli di un cimitero specifico
  if (normalizedTriggerName === "mostra dettagli cimitero") {
    const cimiteroRegex = /cimitero\s+(?:di\s+)?(.+)|mostra(?:mi)?\s+(?:il\s+)?cimitero\s+(?:di\s+)?(.+)/i;
    const match = normalizedQuery.match(cimiteroRegex);
    
    if (match) {
      return {
        isMatch: true,
        matchType: 'cimitero_specifico'
      };
    }
    
    // Verifica anche se la query contiene "dettagli" e "cimitero"
    if ((normalizedQuery.includes("dettagli") || normalizedQuery.includes("informazioni")) && 
        normalizedQuery.includes("cimitero")) {
      return {
        isMatch: true,
        matchType: 'cimitero_generico'
      };
    }
  }
  
  return {
    isMatch: false
  };
};

/**
 * Verifica se la funzione ha frasi di trigger che corrispondono alla query
 * @param func La funzione AI da controllare
 * @param query La query dell'utente
 * @returns true se c'è una corrispondenza
 */
export const hasTriggerMatch = (func: AIFunction, query: string): boolean => {
  // Se la funzione non ha frasi trigger definite, non può fare match
  if (!func.trigger_phrases || func.trigger_phrases.length === 0) {
    return false;
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  
  // Controlla se qualsiasi frase trigger è contenuta nella query
  return func.trigger_phrases.some(phrase => 
    normalizedQuery.includes(phrase.toLowerCase().trim())
  );
};
