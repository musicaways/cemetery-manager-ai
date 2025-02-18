
import { Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APIKeyField } from "./api-keys/APIKeyField";
import { useAPIKeys } from "./api-keys/useAPIKeys";

interface APIKeysTabProps {
  onSave: () => void;
}

export const APIKeysTab = ({ onSave }: APIKeysTabProps) => {
  const {
    groqKey,
    geminiKey,
    perplexityKey,
    huggingfaceKey,
    serpstackKey,
    hasChanges,
    isLoading,
    isTesting,
    handleChange,
    testAPI,
    saveKeys,
    setGroqKey,
    setGeminiKey,
    setPerplexityKey,
    setHuggingfaceKey,
    setSerpstackKey
  } = useAPIKeys(onSave);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <APIKeyField
        label="Groq API Key"
        value={groqKey}
        onChange={(e) => handleChange('groq', e.target.value, setGroqKey)}
        linkUrl="https://console.groq.com/keys"
        linkText="Ottieni la tua Groq API Key"
        provider="Groq"
        onTest={testAPI}
        isTesting={isTesting === "Groq"}
      />

      <APIKeyField
        label="Gemini API Key"
        value={geminiKey}
        onChange={(e) => handleChange('gemini', e.target.value, setGeminiKey)}
        linkUrl="https://makersuite.google.com/app/apikey"
        linkText="Ottieni la tua Gemini API Key"
        provider="Gemini"
        onTest={testAPI}
        isTesting={isTesting === "Gemini"}
      />

      <APIKeyField
        label="Perplexity API Key"
        value={perplexityKey}
        onChange={(e) => handleChange('perplexity', e.target.value, setPerplexityKey)}
        linkUrl="https://docs.perplexity.ai/docs/get-started"
        linkText="Ottieni la tua Perplexity API Key"
        provider="Perplexity"
        onTest={testAPI}
        isTesting={isTesting === "Perplexity"}
      />

      <APIKeyField
        label="HuggingFace API Key"
        value={huggingfaceKey}
        onChange={(e) => handleChange('huggingface', e.target.value, setHuggingfaceKey)}
        linkUrl="https://huggingface.co/settings/tokens"
        linkText="Ottieni la tua HuggingFace API Key"
        provider="HuggingFace"
        onTest={testAPI}
        isTesting={isTesting === "HuggingFace"}
      />

      <APIKeyField
        label="SerpStack API Key"
        value={serpstackKey}
        onChange={(e) => handleChange('serpstack', e.target.value, setSerpstackKey)}
        linkUrl="https://serpstack.com/dashboard"
        linkText="Ottieni la tua SerpStack API Key"
        provider="SerpStack"
        onTest={testAPI}
        isTesting={isTesting === "SerpStack"}
      />

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
