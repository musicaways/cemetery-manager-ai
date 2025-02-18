
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Key, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface APIKeysTabProps {
  onSave: () => void;
}

export const APIKeysTab = ({ onSave }: APIKeysTabProps) => {
  const [groqKey, setGroqKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [perplexityKey, setPerplexityKey] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAPIKeys();
  }, []);

  const loadAPIKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .single();

      if (error) {
        console.error('Error loading API keys:', error);
        return;
      }

      if (data) {
        setGroqKey(data.groq_key || '');
        setGeminiKey(data.gemini_key || '');
        setPerplexityKey(data.perplexity_key || '');
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

  const saveKeys = async () => {
    try {
      const { data: existingKeys } = await supabase
        .from('api_keys')
        .select('id')
        .single();

      if (existingKeys) {
        // Update existing keys
        const { error } = await supabase
          .from('api_keys')
          .update({
            groq_key: groqKey,
            gemini_key: geminiKey,
            perplexity_key: perplexityKey,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingKeys.id);

        if (error) throw error;
      } else {
        // Insert new keys
        const { error } = await supabase
          .from('api_keys')
          .insert([
            {
              groq_key: groqKey,
              gemini_key: geminiKey,
              perplexity_key: perplexityKey
            }
          ]);

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

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-200">
          Groq API Key
        </label>
        <Input
          type="password"
          value={groqKey}
          onChange={(e) => handleChange('groq', e.target.value, setGroqKey)}
          placeholder="Inserisci la tua Groq API Key"
          className="bg-[#1A1F2C] border-white/10"
        />
        <a 
          href="https://console.groq.com/keys" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 mt-1"
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          Ottieni la tua Groq API Key
        </a>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-200">
          Gemini API Key
        </label>
        <Input
          type="password"
          value={geminiKey}
          onChange={(e) => handleChange('gemini', e.target.value, setGeminiKey)}
          placeholder="Inserisci la tua Gemini API Key"
          className="bg-[#1A1F2C] border-white/10"
        />
        <a 
          href="https://makersuite.google.com/app/apikey" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 mt-1"
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          Ottieni la tua Gemini API Key
        </a>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-200">
          Perplexity API Key
        </label>
        <Input
          type="password"
          value={perplexityKey}
          onChange={(e) => handleChange('perplexity', e.target.value, setPerplexityKey)}
          placeholder="Inserisci la tua Perplexity API Key"
          className="bg-[#1A1F2C] border-white/10"
        />
        <a 
          href="https://docs.perplexity.ai/docs/get-started" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 mt-1"
        >
          <ExternalLink className="w-3 h-3 mr-1" />
          Ottieni la tua Perplexity API Key
        </a>
      </div>

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
