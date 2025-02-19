
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MODEL_DESCRIPTIONS, PROVIDER_INFO } from './ModelDescriptions';

export const useAISettings = (onSave: () => void) => {
  const [provider, setProvider] = useState(() => {
    const savedProvider = localStorage.getItem('ai_provider');
    return savedProvider === 'ollama' ? 'groq' : (savedProvider || 'groq');
  });
  const [model, setModel] = useState(() => localStorage.getItem('ai_model') || "mixtral-8x7b-32768");
  const [language, setLanguage] = useState(() => localStorage.getItem('ai_language') || "it");
  const [temperature, setTemperature] = useState(() => parseFloat(localStorage.getItem('ai_temperature') || "0.7"));
  const [hasChanges, setHasChanges] = useState(false);
  const [isTestingModel, setIsTestingModel] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('ai_provider') || localStorage.getItem('ai_provider') === 'ollama') {
      localStorage.setItem('ai_provider', 'groq');
    }
    if (!localStorage.getItem('ai_model')) {
      localStorage.setItem('ai_model', 'mixtral-8x7b-32768');
    }
    if (!localStorage.getItem('ai_language')) {
      localStorage.setItem('ai_language', 'it');
    }
    if (!localStorage.getItem('ai_temperature')) {
      localStorage.setItem('ai_temperature', '0.7');
    }
  }, []);

  const handleProviderChange = (newProvider: string) => {
    if (!newProvider) return;
    setProvider(newProvider);
    setHasChanges(true);
    let newModel = '';
    
    switch(newProvider) {
      case "groq":
        newModel = "mixtral-8x7b-32768";
        break;
      case "gemini":
        newModel = "gemini-pro";
        break;
      default:
        newModel = "mixtral-8x7b-32768";
    }
    
    setModel(newModel);
  };

  const handleModelChange = (newModel: string) => {
    if (!newModel) return;
    setModel(newModel);
    setHasChanges(true);
  };

  const testModel = async () => {
    setIsTestingModel(true);
    try {
      const testPrompt = language === 'it' 
        ? "Chi sei? Rispondi brevemente in italiano."
        : "Who are you? Answer briefly in English.";

      const response = await supabase.functions.invoke('process-query', {
        body: { 
          query: testPrompt,
          aiProvider: provider,
          aiModel: model,
          isTest: true
        }
      });
      
      if (response.error) {
        throw response.error;
      }

      toast.success('Test del modello completato', {
        description: `${MODEL_DESCRIPTIONS[model]?.name} ha risposto correttamente.`
      });
      
      return true;
    } catch (error) {
      console.error('Errore nel test del modello:', error);
      toast.error('Errore nel test del modello', {
        description: 'Il modello selezionato non ha risposto correttamente. Prova a selezionare un altro modello.'
      });
      return false;
    } finally {
      setIsTestingModel(false);
    }
  };

  const saveSettings = async () => {
    const toastLoading = toast.loading('Verifica del modello in corso...');
    
    const testPassed = await testModel();
    
    if (testPassed) {
      localStorage.setItem('ai_provider', provider);
      localStorage.setItem('ai_model', model);
      localStorage.setItem('ai_language', language);
      localStorage.setItem('ai_temperature', temperature.toString());
      setHasChanges(false);
      
      toast.dismiss(toastLoading);
      toast.success('Impostazioni AI salvate con successo');
      
      onSave();
    } else {
      toast.dismiss(toastLoading);
      toast.error('Impossibile salvare le impostazioni', {
        description: 'Il test del modello non è andato a buon fine. Verifica la tua selezione.'
      });
    }
  };

  return {
    provider,
    model,
    language,
    temperature,
    hasChanges,
    isTestingModel,
    handleProviderChange,
    handleModelChange,
    setLanguage,
    setTemperature,
    saveSettings
  };
};
