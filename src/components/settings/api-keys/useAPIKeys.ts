
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useAPIKeys = (onSave: () => void) => {
  const [groqKey, setGroqKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [perplexityKey, setPerplexityKey] = useState('');
  const [huggingfaceKey, setHuggingfaceKey] = useState('');
  const [serpstackKey, setSerpstackKey] = useState('');
  const [googleMapsKey, setGoogleMapsKey] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState<string | null>(null);

  useEffect(() => {
    loadAPIKeys();
  }, []);

  const loadAPIKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error loading API keys:', error);
        setIsLoading(false);
        return;
      }

      if (data) {
        setGroqKey(data.groq_key || '');
        setGeminiKey(data.gemini_key || '');
        setPerplexityKey(data.perplexity_key || '');
        setHuggingfaceKey(data.huggingface_key || '');
        setSerpstackKey(data.serpstack_key || '');
        setGoogleMapsKey(data.googlemaps_key || '');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (key: string, value: string, setter: (value: string) => void) => {
    setter(value);
    setHasChanges(true);
  };

  const testAPI = async (provider: string, apiKey: string) => {
    if (!apiKey) {
      toast.error(`Inserisci prima una chiave API per ${provider}`);
      return;
    }

    setIsTesting(provider);
    
    try {
      // Aggiorniamo prima la chiave nelle Edge Functions
      const { error: updateError } = await supabase.functions.invoke('update-ai-provider', {
        body: { provider: provider.toLowerCase(), apiKey }
      });

      if (updateError) {
        throw updateError;
      }

      let testQuery = "Test API. Rispondi solo 'OK' se funzioni.";
      let testModel = '';

      // Configuriamo il modello corretto per ogni provider
      switch (provider.toLowerCase()) {
        case 'groq':
          testModel = 'mixtral-8x7b-32768';
          break;
        case 'gemini':
          testModel = 'gemini-2.0-flash';
          break;
        case 'perplexity':
          testModel = 'pplx-7b-online';
          break;
        case 'huggingface':
          testModel = 'mistral-7b';
          break;
        default:
          testModel = 'default';
      }

      // Testiamo la chiave
      console.log(`Testing ${provider} with model ${testModel}`);
      const { data, error } = await supabase.functions.invoke('process-query', {
        body: {
          query: testQuery,
          queryType: 'test',
          aiProvider: provider.toLowerCase(),
          aiModel: testModel,
          isTest: true,
          allowGenericResponse: true
        }
      });

      if (error) throw error;

      console.log(`Test response for ${provider}:`, data);

      // Verifichiamo la risposta
      const response = data?.text?.toLowerCase() || '';
      if (!response.includes('ok')) {
        throw new Error('Test fallito: risposta non valida');
      }

      toast.success(`Test API di ${provider} completato con successo`);
    } catch (error) {
      console.error(`Errore nel test dell'API di ${provider}:`, error);
      toast.error(`Errore nel test dell'API di ${provider}. Verifica che la chiave sia corretta.`);
    } finally {
      setIsTesting(null);
    }
  };

  const saveKeys = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('api_keys')
        .select('id')
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      const keysData = {
        groq_key: groqKey,
        gemini_key: geminiKey,
        perplexity_key: perplexityKey,
        huggingface_key: huggingfaceKey,
        serpstack_key: serpstackKey,
        googlemaps_key: googleMapsKey,
        updated_at: new Date().toISOString()
      };

      if (data) {
        const { error } = await supabase
          .from('api_keys')
          .update(keysData)
          .eq('id', data.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('api_keys')
          .insert([keysData]);

        if (error) throw error;
      }

      // Aggiorniamo le chiavi nelle Edge Functions dopo il salvataggio
      const updatePromises = [];

      if (groqKey) {
        updatePromises.push(supabase.functions.invoke('update-ai-provider', {
          body: { provider: 'groq', apiKey: groqKey }
        }));
      }
      if (geminiKey) {
        updatePromises.push(supabase.functions.invoke('update-ai-provider', {
          body: { provider: 'gemini', apiKey: geminiKey }
        }));
      }
      if (perplexityKey) {
        updatePromises.push(supabase.functions.invoke('update-ai-provider', {
          body: { provider: 'perplexity', apiKey: perplexityKey }
        }));
      }
      if (huggingfaceKey) {
        updatePromises.push(supabase.functions.invoke('update-ai-provider', {
          body: { provider: 'huggingface', apiKey: huggingfaceKey }
        }));
      }

      await Promise.all(updatePromises);

      setHasChanges(false);
      toast.success('Chiavi API salvate con successo');
      onSave();
    } catch (error) {
      console.error('Error saving API keys:', error);
      toast.error('Errore durante il salvataggio delle chiavi API');
    }
  };

  return {
    groqKey,
    geminiKey,
    perplexityKey,
    huggingfaceKey,
    serpstackKey,
    googleMapsKey,
    hasChanges,
    isLoading,
    isTesting,
    setGroqKey,
    setGeminiKey,
    setPerplexityKey,
    setHuggingfaceKey,
    setSerpstackKey,
    setGoogleMapsKey,
    handleChange,
    testAPI,
    saveKeys
  };
};
