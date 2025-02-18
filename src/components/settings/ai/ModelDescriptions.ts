
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
  "llama2": {
    name: "Llama 2",
    description: "Versione locale del modello Meta, bilancia bene prestazioni e velocità.",
    strengths: "Ottimo per: uso generale, risposte veloci, basso consumo di risorse",
    details: {
      parameters: "7B parametri",
      context: "4K token di contesto",
      languages: "Multilingua (base)",
      speed: "Velocità di risposta molto alta"
    }
  },
  "llama-3.1-sonar-small-128k-online": {
    name: "Llama 3.1 Sonar Small",
    description: "Modello ottimizzato per risposte precise e ragionamento strutturato.",
    strengths: "Ottimo per: risposte concise, fact-checking, analisi logica",
    details: {
      parameters: "8B parametri",
      context: "128K token di contesto",
      languages: "Multilingua avanzato",
      speed: "Velocità di risposta alta"
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
  "ollama": {
    name: "Ollama",
    description: "Esecuzione locale di modelli AI",
    strengths: "Privacy dei dati, nessuna latenza di rete, personalizzazione"
  },
  "perplexity": {
    name: "Perplexity",
    description: "Provider focalizzato sulla ricerca e analisi",
    strengths: "Ricerca strutturata, citazioni precise, comprensione profonda"
  }
};
