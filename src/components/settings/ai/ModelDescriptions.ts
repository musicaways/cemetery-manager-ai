
export const MODEL_DESCRIPTIONS = {
  "mixtral-8x7b-32768": {
    name: "Mixtral 8x7B",
    description: "Un modello molto potente e versatile, eccellente per compiti complessi come analisi, programmazione e ragionamento strutturato.",
    strengths: "Ottimo per: coding, matematica, analisi dettagliate",
    details: {
      parameters: "46.7B parametri",
      context: "32K token di contesto",
      languages: "Multilingua (29+ lingue)",
      speed: "Velocità di risposta medio-alta"
    }
  },
  "llama2-70b-4096": {
    name: "LLaMA2 70B",
    description: "Modello di grandi dimensioni con eccellenti capacità di comprensione e generazione del linguaggio naturale.",
    strengths: "Ottimo per: scrittura creativa, spiegazioni dettagliate, traduzioni",
    details: {
      parameters: "70B parametri",
      context: "4K token di contesto",
      languages: "Multilingua (20+ lingue)",
      speed: "Velocità di risposta media"
    }
  },
  "gemini-pro": {
    name: "Gemini Pro",
    description: "Modello avanzato di Google con capacità multimodali e comprensione contestuale avanzata.",
    strengths: "Ottimo per: analisi visiva, risposte precise, comprensione del contesto",
    details: {
      parameters: "Non specificato",
      context: "32K token di contesto",
      languages: "Multilingua (>40 lingue)",
      speed: "Velocità di risposta alta"
    }
  },
  "gpt2-large": {
    name: "GPT-2 Large",
    description: "Modello linguistico di base con buone capacità generali",
    strengths: "Ottimo per: generazione di testo, completamento frasi",
    details: {
      parameters: "774M parametri",
      context: "1024 token di contesto",
      languages: "Principalmente inglese",
      speed: "Velocità di risposta molto alta"
    }
  },
  "facebook/opt-1.3b": {
    name: "OPT 1.3B",
    description: "Modello open source di Meta con buon bilanciamento tra dimensioni e prestazioni",
    strengths: "Ottimo per: chat generale, analisi di testo",
    details: {
      parameters: "1.3B parametri",
      context: "2048 token di contesto",
      languages: "Principalmente inglese",
      speed: "Velocità di risposta alta"
    }
  },
  "bigscience/bloom-560m": {
    name: "BLOOM 560M",
    description: "Modello multilingue leggero e versatile",
    strengths: "Ottimo per: processamento multilingue, tasks generali",
    details: {
      parameters: "560M parametri",
      context: "2048 token di contesto",
      languages: "Multilingua (46+ lingue)",
      speed: "Velocità di risposta molto alta"
    }
  }
};

export const PROVIDER_INFO = {
  "groq": {
    name: "Groq",
    description: "Provider specializzato in inferenza ad alta velocità",
    strengths: "Velocità di risposta eccezionale, ottimizzazione hardware"
  },
  "gemini": {
    name: "Gemini",
    description: "Servizio AI di Google Cloud",
    strengths: "Integrazione multimodale, comprensione contestuale avanzata"
  },
  "huggingface": {
    name: "HuggingFace",
    description: "Piattaforma open source per modelli AI",
    strengths: "Ampia varietà di modelli, facilità di utilizzo"
  }
};
