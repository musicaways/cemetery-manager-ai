
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Key } from "lucide-react";

export const APIKeysTab = () => {
  const [groqKey, setGroqKey] = useState(localStorage.getItem('GROQ_API_KEY') || '');
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('GEMINI_API_KEY') || '');
  const [perplexityKey, setPerplexityKey] = useState(localStorage.getItem('PERPLEXITY_API_KEY') || '');

  const saveKeys = () => {
    localStorage.setItem('GROQ_API_KEY', groqKey);
    localStorage.setItem('GEMINI_API_KEY', geminiKey);
    localStorage.setItem('PERPLEXITY_API_KEY', perplexityKey);
    toast.success('Chiavi API salvate con successo');
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
          onChange={(e) => setGroqKey(e.target.value)}
          placeholder="Inserisci la tua Groq API Key"
          className="bg-[#1A1F2C] border-white/10"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-200">
          Gemini API Key
        </label>
        <Input
          type="password"
          value={geminiKey}
          onChange={(e) => setGeminiKey(e.target.value)}
          placeholder="Inserisci la tua Gemini API Key"
          className="bg-[#1A1F2C] border-white/10"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-200">
          Perplexity API Key
        </label>
        <Input
          type="password"
          value={perplexityKey}
          onChange={(e) => setPerplexityKey(e.target.value)}
          placeholder="Inserisci la tua Perplexity API Key"
          className="bg-[#1A1F2C] border-white/10"
        />
      </div>

      <Button onClick={saveKeys} className="w-full">
        <Key className="w-4 h-4 mr-2" />
        Salva Chiavi API
      </Button>
    </div>
  );
};
