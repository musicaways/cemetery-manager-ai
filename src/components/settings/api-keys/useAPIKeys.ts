
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
      // Test specifici per tipo di API
      if (provider.toLowerCase() === 'googlemaps') {
        // Test di Google Maps API con una semplice richiesta di geocoding
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=Via+Roma,Roma&key=${apiKey}`
        );
        const data = await response.json();
        
        console.log('Google Maps test response:', data);
        
        if (data.status === 'OK' || data.status === 'ZERO_RESULTS') {
          // Se il test ha successo, aggiorniamo la chiave nelle Edge Functions
          const { error: updateError } = await supabase.functions.invoke('update-ai-provider', {
            body: { provider: provider.toLowerCase(), apiKey }
          });

          if (updateError) throw updateError;
          
          toast.success(`Test API di ${provider} completato con successo`);
          return;
        } else {
          throw new Error(`Google Maps API error: ${data.status}`);
        }
      } 
      
      if (provider.toLowerCase() === 'serpstack') {
        // Test di SerpStack con una semplice query di ricerca
        const response = await fetch(
          `http://api.serpstack.com/search?access_key=${apiKey}&query=test`
        );
        const data = await response.json();
        
        console.log('SerpStack test response:', data);
        
        if (!data.error) {
          // Se il test ha successo, aggiorniamo la chiave nelle Edge Functions
          const { error: updateError } = await supabase.functions.invoke('update-ai-provider', {
            body: { provider: provider.toLowerCase(), apiKey }
          });

          if (updateError) throw updateError;
          
          toast.success(`Test API di ${provider} completato con successo`);
          return;
        } else {
          throw new Error(`SerpStack API error: ${data.error.info}`);
        }
      }

      // Per i modelli linguistici (Groq, Gemini, Perplexity, HuggingFace)
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

      console.log(`Testing ${provider} with model ${testModel}`);
      
      // Test del modello linguistico
      const { data, error } = await supabase.functions.invoke('test-api-provider', {
        body: {
          provider: provider.toLowerCase(),
          apiKey,
          model: testModel
        }
      });

      if (error) {
        console.error('Test API error:', error);
        throw error;
      }

      // Se il test ha successo, aggiorniamo la chiave nelle Edge Functions
      const { error: updateError } = await supabase.functions.invoke('update-ai-provider', {
        body: { provider: provider.toLowerCase(), apiKey }
      });

      if (updateError) throw updateError;

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
