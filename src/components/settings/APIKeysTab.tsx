
import { Key, Link, KeyRound, MessageSquare, Search, Bot, Brain, Sparkles, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAPIKeys } from "./api-keys/useAPIKeys";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

  const renderAPIKeySection = (
    provider: string,
    icon: React.ReactNode,
    description: string,
    value: string,
    setter: (value: string) => void,
    linkUrl: string,
    linkText: string
  ) => (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        {icon}
        <div>
          <h3 className="text-sm font-medium text-gray-200">{provider}</h3>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
      <div className="relative">
        <Input
          type="password"
          value={value}
          onChange={(e) => handleChange(provider.toLowerCase(), e.target.value, setter)}
          placeholder={`Inserisci qui la tua chiave API ${provider}`}
          className="bg-[var(--message-bg)] border-[var(--border-color)] pr-24"
        />
        <Button
          onClick={() => testAPI(provider, value)}
          disabled={!value || isTesting === provider}
          variant="secondary"
          size="sm"
          className="absolute right-1 top-1 h-8"
        >
          {isTesting === provider ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            "Test"
          )}
        </Button>
      </div>
      <a 
        href={linkUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center text-sm text-[var(--primary-color)] hover:text-[var(--primary-hover)] transition-colors"
      >
        <Link className="w-3 h-3 mr-1" />
        {linkText}
      </a>
    </div>
  );

  return (
    <div className="space-y-6">
      <Accordion type="single" collapsible defaultValue="llm" className="w-full space-y-4">
        <AccordionItem value="llm" className="border-none">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2 text-base font-semibold text-gray-200">
              <MessageSquare className="w-4 h-4" />
              LLM API Keys
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 mt-4">
              {renderAPIKeySection(
                "Groq",
                <Bot className="w-5 h-5 text-[var(--primary-color)]" />,
                "Modello LLM veloce e performante, ottimo per generazione di testo e chat",
                groqKey,
                setGroqKey,
                "https://console.groq.com/keys",
                "Ottieni la tua Groq API Key"
              )}
              {renderAPIKeySection(
                "Gemini",
                <Sparkles className="w-5 h-5 text-[var(--primary-color)]" />,
                "LLM di Google, supporta analisi di immagini e generazione di testo",
                geminiKey,
                setGeminiKey,
                "https://makersuite.google.com/app/apikey",
                "Ottieni la tua Gemini API Key"
              )}
              {renderAPIKeySection(
                "Perplexity",
                <Brain className="w-5 h-5 text-[var(--primary-color)]" />,
                "LLM specializzato in ricerca e analisi di informazioni",
                perplexityKey,
                setPerplexityKey,
                "https://docs.perplexity.ai/docs/get-started",
                "Ottieni la tua Perplexity API Key"
              )}
              {renderAPIKeySection(
                "HuggingFace",
                <Cpu className="w-5 h-5 text-[var(--primary-color)]" />,
                "Accesso a migliaia di modelli AI open source",
                huggingfaceKey,
                setHuggingfaceKey,
                "https://huggingface.co/settings/tokens",
                "Ottieni la tua HuggingFace API Key"
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="search" className="border-none">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2 text-base font-semibold text-gray-200">
              <Search className="w-4 h-4" />
              Search API Keys
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 mt-4">
              {renderAPIKeySection(
                "SerpStack",
                <Search className="w-5 h-5 text-[var(--primary-color)]" />,
                "API per ricerche web in tempo reale",
                serpstackKey,
                setSerpstackKey,
                "https://serpstack.com/dashboard",
                "Ottieni la tua SerpStack API Key"
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

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
