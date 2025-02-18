
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useAPIKeys = (onSave: () => void) => {
  const [groqKey, setGroqKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [perplexityKey, setPerplexityKey] = useState('');
  const [huggingfaceKey, setHuggingfaceKey] = useState('');
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
      const response = await fetch(`${window.location.origin}/api/process-query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: "Ciao! Questo è un test.",
          queryType: "chat",
          isTest: true,
          aiProvider: provider.toLowerCase(),
          aiModel: provider === "Groq" ? "mixtral-8x7b-32768" : 
                  provider === "Gemini" ? "gemini-pro" :
                  provider === "Perplexity" ? "mixtral-8x7b" : "mistral-7b"
        }),
      });

      if (!response.ok) {
        throw new Error(`Errore durante il test dell'API di ${provider}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      toast.success(`Test dell'API di ${provider} completato con successo!`);
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
            huggingface_key: huggingfaceKey
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
    hasChanges,
    isLoading,
    isTesting,
    setGroqKey,
    setGeminiKey,
    setPerplexityKey,
    setHuggingfaceKey,
    handleChange,
    testAPI,
    saveKeys
  };
};
