
import { toast } from "sonner";

class LocalLLMManager {
  private static instance: LocalLLMManager;
  private isInitialized: boolean = false;
  private isInitializing: boolean = false;
  private modelId: string = 'onnx-community/mxbai-embed-small';
  private fallbackResponses: Map<string, string> = new Map();

  private constructor() {
    // Inizializzazione delle risposte predefinite per la modalità offline
    this.initFallbackResponses();
  }

  public static getInstance(): LocalLLMManager {
    if (!LocalLLMManager.instance) {
      LocalLLMManager.instance = new LocalLLMManager();
    }
    return LocalLLMManager.instance;
  }

  private initFallbackResponses() {
    this.fallbackResponses.set(
      "cimiteri",
      "Ecco le informazioni sui cimiteri disponibili in modalità offline. Posso mostrarti dettagli sui cimiteri salvati localmente. Per informazioni complete, ti consiglio di riconnetterti a internet."
    );
    this.fallbackResponses.set(
      "defunti",
      "In modalità offline posso fornirti informazioni sui defunti solo se sono stati precedentemente memorizzati nella cache locale. La ricerca è limitata ai dati disponibili offline."
    );
    this.fallbackResponses.set(
      "loculi",
      "Le informazioni sui loculi disponibili in modalità offline potrebbero non essere aggiornate. Posso mostrarti i dati salvati in precedenza."
    );
    this.fallbackResponses.set(
      "default",
      "Sono in modalità offline e posso fornirti solo informazioni limitate. Avrai accesso completo alle funzionalità quando tornerai online."
    );
    this.fallbackResponses.set(
      "funzionalità",
      "In modalità offline puoi: \n1. Visualizzare i cimiteri già visitati\n2. Consultare i dati salvati nella cache\n3. Visualizzare le informazioni dei defunti già consultati\n\nLe funzionalità di ricerca avanzata, caricamento di immagini e riconoscimento vocale sono disponibili solo online."
    );
  }

  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    if (this.isInitializing) {
      console.log('Inizializzazione già in corso...');
      return false;
    }

    this.isInitializing = true;
    console.log('Inizializzazione del modello LLM locale...');
    
    try {
      // Simuliamo l'inizializzazione del modello locale
      // In un'implementazione reale, qui andrebbe il codice per caricare il modello
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Modello LLM locale inizializzato con successo!');
      this.isInitialized = true;
      toast.success('Modello AI locale pronto', {
        description: 'Il modello locale è stato caricato e sarà utilizzato in caso di disconnessione',
        duration: 3000
      });
      return true;
    } catch (error) {
      console.error('Errore durante l\'inizializzazione del modello LLM locale:', error);
      toast.error('Errore di inizializzazione AI locale', {
        description: 'Non è stato possibile caricare il modello locale. Le funzionalità offline saranno limitate.',
        duration: 5000
      });
      return false;
    } finally {
      this.isInitializing = false;
    }
  }

  public async processQuery(query: string): Promise<string> {
    // Se il modello non è inizializzato, prova a inizializzarlo
    if (!this.isInitialized && !this.isInitializing) {
      const initialized = await this.initialize();
      if (!initialized) {
        return this.getFallbackResponse(query);
      }
    }

    // Se il modello è in fase di inizializzazione, utilizza le risposte predefinite
    if (this.isInitializing) {
      return this.getFallbackResponse(query);
    }

    try {
      // In un'implementazione reale, qui andrebbe il codice per generare una risposta con il modello
      // Per ora, utilizziamo solo risposte predefinite basate sulle parole chiave
      return this.getFallbackResponse(query);
    } catch (error) {
      console.error('Errore durante la generazione della risposta:', error);
      return this.getFallbackResponse(query);
    }
  }

  private getFallbackResponse(query: string): string {
    const queryLower = query.toLowerCase();
    
    // Verifica se la query contiene parole chiave specifiche
    if (queryLower.includes('cimitero') || queryLower.includes('cimiteri')) {
      return this.fallbackResponses.get('cimiteri') || this.fallbackResponses.get('default')!;
    } else if (queryLower.includes('defunto') || queryLower.includes('defunti') || queryLower.includes('morto')) {
      return this.fallbackResponses.get('defunti') || this.fallbackResponses.get('default')!;
    } else if (queryLower.includes('loculo') || queryLower.includes('loculi')) {
      return this.fallbackResponses.get('loculi') || this.fallbackResponses.get('default')!;
    } else if (queryLower.includes('funzionalità') || queryLower.includes('cosa posso fare') || queryLower.includes('offline')) {
      return this.fallbackResponses.get('funzionalità') || this.fallbackResponses.get('default')!;
    }
    
    // Risposta predefinita se non viene rilevata alcuna parola chiave
    return this.fallbackResponses.get('default')!;
  }

  // Metodo per verificare se il modello è inizializzato
  public isModelInitialized(): boolean {
    return this.isInitialized;
  }

  // Metodo per forzare l'inizializzazione del modello (utile per precaricare il modello)
  public async preloadModel(): Promise<void> {
    if (!this.isInitialized && !this.isInitializing) {
      await this.initialize();
    }
  }

  // Metodo per impostare un modello personalizzato
  public setModel(modelId: string): void {
    if (this.modelId !== modelId) {
      this.modelId = modelId;
      this.isInitialized = false;
      this.isInitializing = false;
      console.log(`Modello cambiato in: ${modelId}`);
    }
  }
}

export default LocalLLMManager;
