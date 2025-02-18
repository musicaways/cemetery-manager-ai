import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Key, ExternalLink } from "lucide-react";

interface APIKeysTabProps {
  onSave: () => void;
}

export const APIKeysTab = ({ onSave }: APIKeysTabProps) => {
  const [groqKey, setGroqKey] = useState(localStorage.getItem('GROQ_API_KEY') || '');
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('GEMINI_API_KEY') || '');
  const [perplexityKey, setPerplexityKey] = useState(localStorage.getItem('PERPLEXITY_API_KEY') || '');
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (key: string, value: string, setter: (value: string) => void) => {
    setter(value);
    setHasChanges(true);
  };

  const saveKeys = () => {
    localStorage.setItem('GROQ_API_KEY', groqKey);
    localStorage.setItem('GEMINI_API_KEY', geminiKey);
    localStorage.setItem('PERPLEXITY_API_KEY', perplexityKey);
    setHasChanges(false);
    toast.success('Chiavi API salvate con successo');
    onSave();
  };

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
