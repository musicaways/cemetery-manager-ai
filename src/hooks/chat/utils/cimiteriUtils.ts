
import { supabase } from "@/integrations/supabase/client";
import { Cimitero } from "@/pages/cimiteri/types";
import { offlineManager } from "@/lib/offline/offlineManager";
import { errorReporter } from "@/lib/errorReporter";

export const isListaCimiteriQuery = (query: string): boolean => {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Modelli di pattern che indicano richieste di liste cimiteri
  const patterns = [
    /mostra(?:mi)?\s+(?:tutti\s+)?(?:i\s+)?cimiter[io]/i,
    /(?:lista|elenco)(?:\s+(?:dei|di|dei|di\s+tutti))?\s+(?:i\s+)?cimiter[io]/i,
    /visualizza(?:\s+(?:tutti))?\s+(?:i\s+)?cimiter[io]/i,
    /vedi(?:\s+(?:tutti))?\s+(?:i\s+)?cimiter[io]/i
  ];

  return patterns.some(pattern => pattern.test(normalizedQuery));
};

export const debugListaCimiteriMatch = (query: string): { matched: boolean; matchedPattern?: string } => {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Pattern specifici con nomi per debug
  const namedPatterns = [
    { name: "mostra cimiteri", pattern: /mostra(?:mi)?\s+(?:tutti\s+)?(?:i\s+)?cimiter[io]/i },
    { name: "lista/elenco cimiteri", pattern: /(?:lista|elenco)(?:\s+(?:dei|di|dei|di\s+tutti))?\s+(?:i\s+)?cimiter[io]/i },
    { name: "visualizza cimiteri", pattern: /visualizza(?:\s+(?:tutti))?\s+(?:i\s+)?cimiter[io]/i },
    { name: "vedi cimiteri", pattern: /vedi(?:\s+(?:tutti))?\s+(?:i\s+)?cimiter[io]/i }
  ];
  
  // Controlla prima i pattern
  for (const { name, pattern } of namedPatterns) {
    if (pattern.test(normalizedQuery)) {
      return { matched: true, matchedPattern: name };
    }
  }
  
  // Se non ha trovato match specifici ma contiene parole chiave
  if (normalizedQuery.includes("cimiteri") || normalizedQuery.includes("cimitero")) {
    if (normalizedQuery.includes("tutti") || 
        normalizedQuery.includes("elenco") || 
        normalizedQuery.includes("lista")) {
      return { matched: true, matchedPattern: "parole chiave generiche" };
    }
  }
  
  return { matched: false };
};

export const extractCimiteroName = (query: string): string | null => {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Regexp per estrarre nomi di cimiteri
  const patterns = [
    /cimitero\s+(?:di\s+)?(.+)/i,
    /mostra(?:mi)?\s+(?:il\s+)?cimitero\s+(?:di\s+)?(.+)/i,
    /informazioni\s+(?:su(?:l)?\s+)?(?:il\s+)?cimitero\s+(?:di\s+)?(.+)/i
  ];
  
  for (const pattern of patterns) {
    const match = normalizedQuery.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
};

export const fetchAllCimiteri = async (): Promise<Cimitero[]> => {
  try {
    // Prima verifichiamo se abbiamo dati in cache
    const cachedData = await offlineManager.getCimiteri();
    
    // Se siamo offline e abbiamo dati in cache, usiamo quelli
    if (!navigator.onLine && cachedData && cachedData.length > 0) {
      console.log("Utilizzando dati dei cimiteri dalla cache (offline)");
      return cachedData;
    }
    
    // Altrimenti, se siamo online, facciamo la richiesta al server
    if (navigator.onLine) {
      console.log("Caricamento cimiteri dal server...");
      const { data, error } = await supabase
        .from('Cimitero')
        .select(`
          *,
          settori:Settore(
            Id,
            Codice,
            Descrizione,
            blocchi:Blocco(*)
          ),
          foto:CimiteroFoto(*),
          documenti:CimiteroDocumenti(*)
        `)
        .order('Descrizione', { ascending: true });

      if (error) {
        console.error("Errore nel caricamento dei cimiteri:", error);
        throw error;
      }

      if (data) {
        // Salviamo i dati nella cache per utilizzo offline futuro
        // Forziamo il tipo con as unknown as Cimitero[]
        await offlineManager.saveCimitero(data as unknown as Cimitero[]);
        return data as unknown as Cimitero[];
      }
    }
    
    // Se siamo offline ma abbiamo dati in cache, li usiamo
    if (cachedData && cachedData.length > 0) {
      console.log("Utilizzando dati dei cimiteri dalla cache");
      return cachedData;
    }
    
    // Se arriviamo qui, non abbiamo dati né online né in cache
    return [];
  } catch (error) {
    console.error("Errore nel caricamento dei cimiteri:", error);
    errorReporter.reportError(error as Error, { action: 'fetchAllCimiteri' });
    
    // In caso di errore, tentiamo di usare i dati in cache
    const cachedData = await offlineManager.getCimiteri();
    if (cachedData && cachedData.length > 0) {
      return cachedData;
    }
    
    return [];
  }
};

export const fetchCimiteroDetails = async (nomeOrCodice: string): Promise<Cimitero | null> => {
  try {
    // Prepara il termine di ricerca rimuovendo spazi iniziali/finali e converti in minuscolo
    const searchTerm = nomeOrCodice.trim().toLowerCase();
    
    // Prima controlliamo la cache
    const cachedData = await offlineManager.getCimiteri();
    const cimiteroFromCache = cachedData && cachedData.find(c => 
      c.Codice?.toLowerCase() === searchTerm || 
      c.Descrizione?.toLowerCase().includes(searchTerm)
    );
    
    // Se siamo offline e troviamo una corrispondenza in cache, usiamo quella
    if (!navigator.onLine && cimiteroFromCache) {
      console.log("Utilizzando dati del cimitero dalla cache (offline)");
      return cimiteroFromCache;
    }
    
    // Se siamo online, facciamo la richiesta al server
    if (navigator.onLine) {
      console.log(`Caricamento dettagli cimitero per: ${searchTerm}`);
      const { data, error } = await supabase
        .from('Cimitero')
        .select(`
          *,
          settori:Settore(
            Id,
            Codice,
            Descrizione,
            blocchi:Blocco(*)
          ),
          foto:CimiteroFoto(*),
          documenti:CimiteroDocumenti(*)
        `)
        .or(`Codice.ilike.%${searchTerm}%,Descrizione.ilike.%${searchTerm}%`)
        .limit(1);

      if (error) {
        console.error("Errore nel caricamento dei dettagli del cimitero:", error);
        throw error;
      }

      if (data && data.length > 0) {
        console.log("Dettagli cimitero caricati dal server:", data[0]);
        return data[0] as unknown as Cimitero;
      }
    }
    
    // Torniamo ai dati in cache se non troviamo nulla online
    if (cimiteroFromCache) {
      console.log("Utilizzando dati del cimitero dalla cache");
      return cimiteroFromCache;
    }
    
    console.log(`Nessun cimitero trovato per: ${searchTerm}`);
    return null;
  } catch (error) {
    console.error("Errore nel caricamento dei dettagli del cimitero:", error);
    errorReporter.reportError(error as Error, { 
      action: 'fetchCimiteroDetails', 
      searchTerm: nomeOrCodice 
    });
    
    // In caso di errore, tentiamo di usare i dati in cache
    const cachedData = await offlineManager.getCimiteri();
    const searchTerm = nomeOrCodice.trim().toLowerCase();
    const cimiteroFromCache = cachedData && cachedData.find(c => 
      c.Codice?.toLowerCase() === searchTerm || 
      c.Descrizione?.toLowerCase().includes(searchTerm)
    );
    
    if (cimiteroFromCache) {
      return cimiteroFromCache;
    }
    
    return null;
  }
};
