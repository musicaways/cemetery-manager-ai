
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
      // Aggiorniamo la chiave in Supabase Edge Functions
      const { error: updateError } = await supabase.functions.invoke('update-ai-provider', {
        body: { provider: provider.toLowerCase(), apiKey }
      });

      if (updateError) {
        throw updateError;
      }

      // Testiamo la chiave con una query di test
      const { data, error } = await supabase.functions.invoke('process-query', {
        body: {
          query: "Test. Rispondi solo 'OK' se funziono.",
          queryType: 'test',
          aiProvider: provider.toLowerCase(),
          aiModel: provider === 'Groq' ? 'mixtral-8x7b-32768' : 'gemini-pro',
          isTest: true
        }
      });

      if (error || !data?.text?.includes('OK')) {
        throw new Error('Test fallito');
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

      if (data) {
        const { error } = await supabase
          .from('api_keys')
          .update({
            groq_key: groqKey,
            gemini_key: geminiKey,
            perplexity_key: perplexityKey,
            huggingface_key: huggingfaceKey,
            serpstack_key: serpstackKey,
            googlemaps_key: googleMapsKey,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('api_keys')
          .insert([{
            groq_key: groqKey,
            gemini_key: geminiKey,
            perplexity_key: perplexityKey,
            huggingface_key: huggingfaceKey,
            serpstack_key: serpstackKey,
            googlemaps_key: googleMapsKey
          }]);

        if (error) throw error;
      }

      // Aggiorniamo le chiavi nelle Edge Functions dopo il salvataggio
      const promises = [];
      if (groqKey) {
        promises.push(supabase.functions.invoke('update-ai-provider', {
          body: { provider: 'groq', apiKey: groqKey }
        }));
      }
      if (geminiKey) {
        promises.push(supabase.functions.invoke('update-ai-provider', {
          body: { provider: 'gemini', apiKey: geminiKey }
        }));
      }

      await Promise.all(promises);

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
