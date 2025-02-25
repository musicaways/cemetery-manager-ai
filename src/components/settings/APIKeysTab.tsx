
import { Key, Link, KeyRound, MessageSquare, Search, Map } from "lucide-react";
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
    googleMapsKey,
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
    setSerpstackKey,
    setGoogleMapsKey
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
    label: string,
    value: string,
    setter: (value: string) => void,
    linkUrl: string,
    linkText: string
  ) => (
    <div className="space-y-3">
      <div className="relative">
        <Input
          type="password"
          value={value}
          onChange={(e) => handleChange(provider.toLowerCase(), e.target.value, setter)}
          placeholder={`Inserisci la tua ${label}`}
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
      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="maps" className="border-none">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2 text-base font-semibold text-gray-200">
              <Map className="w-4 h-4" />
              Maps API Keys
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 mt-4">
              {renderAPIKeySection(
                "GoogleMaps",
                <KeyRound className="w-4 h-4" />,
                "Google Maps API Key",
                googleMapsKey,
                setGoogleMapsKey,
                "https://console.cloud.google.com/google/maps-apis/credentials",
                "Ottieni la tua Google Maps API Key"
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

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
                <KeyRound className="w-4 h-4" />,
                "Groq API Key",
                groqKey,
                setGroqKey,
                "https://console.groq.com/keys",
                "Ottieni la tua Groq API Key"
              )}
              {renderAPIKeySection(
                "Gemini",
                <KeyRound className="w-4 h-4" />,
                "Gemini API Key",
                geminiKey,
                setGeminiKey,
                "https://makersuite.google.com/app/apikey",
                "Ottieni la tua Gemini API Key"
              )}
              {renderAPIKeySection(
                "Perplexity",
                <KeyRound className="w-4 h-4" />,
                "Perplexity API Key",
                perplexityKey,
                setPerplexityKey,
                "https://docs.perplexity.ai/docs/get-started",
                "Ottieni la tua Perplexity API Key"
              )}
              {renderAPIKeySection(
                "HuggingFace",
                <KeyRound className="w-4 h-4" />,
                "HuggingFace API Key",
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
                <KeyRound className="w-4 h-4" />,
                "SerpStack API Key",
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
