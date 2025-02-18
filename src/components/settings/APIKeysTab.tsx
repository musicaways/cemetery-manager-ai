
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Key, ExternalLink, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface APIKeysTabProps {
  onSave: () => void;
}

export const APIKeysTab = ({ onSave }: APIKeysTabProps) => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  const renderAPIField = (
    label: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    linkUrl: string,
    linkText: string,
    provider: string
  ) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-200">
        {label}
      </label>
      <div className="flex gap-2">
        <Input
          type="password"
          value={value}
          onChange={onChange}
          placeholder={`Inserisci la tua ${label}`}
          className="bg-[#1A1F2C] border-white/10 flex-1"
        />
        <Button
          onClick={() => testAPI(provider, value)}
          disabled={!value || isTesting === provider}
          variant="secondary"
          className="whitespace-nowrap"
        >
          {isTesting === provider ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Check className="w-4 h-4" />
          )}
          Test
        </Button>
      </div>
      <a 
        href={linkUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 mt-1"
      >
        <ExternalLink className="w-3 h-3 mr-1" />
        {linkText}
      </a>
    </div>
  );

  return (
    <div className="space-y-4">
      {renderAPIField(
        "Groq API Key",
        groqKey,
        (e) => handleChange('groq', e.target.value, setGroqKey),
        "https://console.groq.com/keys",
        "Ottieni la tua Groq API Key",
        "Groq"
      )}

      {renderAPIField(
        "Gemini API Key",
        geminiKey,
        (e) => handleChange('gemini', e.target.value, setGeminiKey),
        "https://makersuite.google.com/app/apikey",
        "Ottieni la tua Gemini API Key",
        "Gemini"
      )}

      {renderAPIField(
        "Perplexity API Key",
        perplexityKey,
        (e) => handleChange('perplexity', e.target.value, setPerplexityKey),
        "https://docs.perplexity.ai/docs/get-started",
        "Ottieni la tua Perplexity API Key",
        "Perplexity"
      )}

      {renderAPIField(
        "HuggingFace API Key",
        huggingfaceKey,
        (e) => handleChange('huggingface', e.target.value, setHuggingfaceKey),
        "https://huggingface.co/settings/tokens",
        "Ottieni la tua HuggingFace API Key",
        "HuggingFace"
      )}

      <Button 
        onClick={saveKeys} 
        className="w-full"
        disabled={!hasChanges}
      >
        <Key className="w-4 h-4 mr-2" />
        {hasChanges ? 'Salva Modifiche' : 'Nessuna Modifica'}
      </Button>
    </div>
  );
};
