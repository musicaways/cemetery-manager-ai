
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
      const response = await fetch(`${window.location.origin}/api/test-api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          apiKey
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }

      toast.success(data.message);
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
