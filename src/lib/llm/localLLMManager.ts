
import { pipeline, env } from '@huggingface/transformers';
import type { AIResponse } from '@/utils/types';

// Configura l'ambiente per utilizzare WebGPU quando disponibile
env.useBrowserCache = true;
env.useCustomBackend = true;
env.preferredDevice = 'auto';

class LocalLLMManager {
  private model: any = null;
  private modelLoading = false;
  private modelReady = false;
  private modelName = 'onnx-community/mxbai-embed-small';
  
  constructor() {
    // Avvia il precaricamento del modello se il browser è supportato
    if (typeof window !== 'undefined' && 'navigator' in window) {
      this.initialize();
    }
  }
  
  async initialize() {
    if (this.modelLoading || this.modelReady) return;
    
    this.modelLoading = true;
    try {
      console.log('Initializing local LLM...');
      
      // Carica il modello per embedding (più leggero di un modello di generazione)
      this.model = await pipeline('feature-extraction', this.modelName, {
        quantized: true
      });
      
      this.modelReady = true;
      console.log('Local LLM initialized successfully');
    } catch (error) {
      console.error('Failed to load local LLM:', error);
    } finally {
      this.modelLoading = false;
    }
  }
  
  async isAvailable(): Promise<boolean> {
    if (!this.modelReady && !this.modelLoading) {
      this.initialize(); // Inizia a caricare il modello in background
    }
    return this.modelReady;
  }
  
  async processQuery(query: string): Promise<AIResponse> {
    if (!this.modelReady) {
      if (!this.modelLoading) {
        await this.initialize();
      }
      
      // Se il modello non è ancora pronto, ritorna un messaggio appropriato
      if (!this.modelReady) {
        return {
          text: "Modello AI locale non disponibile. Funzionalità limitate in modalità offline.",
          data: null
        };
      }
    }
    
    try {
      // Per un modello di embedding, non possiamo generare testo ma possiamo verificare se funziona
      await this.model(query, { pooling: "mean", normalize: true });
      
      // Rispondi con un messaggio predefinito per il caso offline
      const offlineResponses = [
        "Mi dispiace, sono in modalità offline. Posso aiutarti con informazioni di base sui cimiteri, ma la mia funzionalità è limitata.",
        "Sono attualmente in modalità offline. Prova a cercare nella lista dei cimiteri o consulta le informazioni disponibili localmente.",
        "In modalità offline posso solo fornirti supporto di base. Riconnettiti a internet per utilizzare tutte le funzionalità."
      ];
      
      // Scegli una risposta casuale
      const responseIndex = Math.floor(Math.random() * offlineResponses.length);
      
      return {
        text: offlineResponses[responseIndex],
        data: null
      };
    } catch (error) {
      console.error('Error with local LLM:', error);
      return {
        text: "Si è verificato un errore con il modello AI locale.",
        data: null,
        error: "Errore di elaborazione locale"
      };
    }
  }
}

export const localLLM = new LocalLLMManager();
