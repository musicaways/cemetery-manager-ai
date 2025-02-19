
import { Bot, Cpu, Languages, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAISettings } from './ai/useAISettings';
import { ModelSelector } from './ai/ModelSelector';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface AITabProps {
  onSave: () => void;
}

export const AITab = ({ onSave }: AITabProps) => {
  const {
    provider,
    model,
    language,
    temperature,
    hasChanges,
    isTestingModel,
    handleProviderChange,
    handleModelChange,
    setLanguage,
    setTemperature,
    saveSettings
  } = useAISettings(onSave);

  const renderProviderCard = (providerId: string, name: string, description: string, icon: React.ReactNode) => (
    <button
      onClick={() => handleProviderChange(providerId)}
      className={`p-4 rounded-lg border transition-all ${
        provider === providerId
          ? 'bg-[var(--primary-color)] border-[var(--primary-color)]'
          : 'bg-[var(--message-bg)] border-[var(--border-color)] hover:border-[var(--primary-color)] hover:border-opacity-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={provider === providerId ? 'text-white' : 'text-[var(--primary-color)]'}>
          {icon}
        </div>
        <div className="text-left">
          <span className={`text-sm font-medium block ${provider === providerId ? 'text-white' : 'text-gray-200'}`}>
            {name}
          </span>
          <p className={`text-xs mt-1 ${provider === providerId ? 'text-white/90' : 'text-gray-400'}`}>
            {description}
          </p>
        </div>
      </div>
    </button>
  );

  return (
    <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="provider" className="border-none">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2 text-base font-semibold text-gray-200">
              <Bot className="w-4 h-4" />
              Provider AI
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-3 mt-4">
              {renderProviderCard(
                'groq',
                'Groq',
                'Provider veloce e performante, ottimo per elaborazione di testo',
                <Cpu className="w-5 h-5" />
              )}
              {renderProviderCard(
                'gemini',
                'Gemini',
                'Servizio AI di Google con supporto multimodale',
                <Bot className="w-5 h-5" />
              )}
              {renderProviderCard(
                'huggingface',
                'HuggingFace',
                'Accesso a migliaia di modelli open source',
                <Bot className="w-5 h-5" />
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="model" className="border-none">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2 text-base font-semibold text-gray-200">
              <Cpu className="w-4 h-4" />
              Modello
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="mt-4">
              <ModelSelector 
                provider={provider} 
                model={model} 
                onModelChange={handleModelChange}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="language" className="border-none">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2 text-base font-semibold text-gray-200">
              <Languages className="w-4 h-4" />
              Lingua
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => setLanguage('it')}
                className={`p-4 rounded-lg border transition-all ${
                  language === 'it'
                    ? 'bg-[var(--primary-color)] border-[var(--primary-color)]'
                    : 'bg-[var(--message-bg)] border-[var(--border-color)]'
                }`}
              >
                <span className="text-2xl mb-2 block">🇮🇹</span>
                <span className="text-sm font-medium block">Italiano</span>
              </button>

              <button
                onClick={() => setLanguage('en')}
                className={`p-4 rounded-lg border transition-all ${
                  language === 'en'
                    ? 'bg-[var(--primary-color)] border-[var(--primary-color)]'
                    : 'bg-[var(--message-bg)] border-[var(--border-color)]'
                }`}
              >
                <span className="text-2xl mb-2 block">🇬🇧</span>
                <span className="text-sm font-medium block">English</span>
              </button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="temperature" className="border-none">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2 text-base font-semibold text-gray-200">
              <Sparkles className="w-4 h-4" />
              Temperatura (Creatività)
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 mt-4">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-2 bg-[var(--message-bg)] rounded-lg appearance-none cursor-pointer accent-[var(--primary-color)]"
              />
              <div className="flex justify-between text-sm text-gray-400">
                <span>Preciso</span>
                <span>Creativo</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {hasChanges && (
        <Button 
          onClick={saveSettings} 
          className="w-full"
          disabled={isTestingModel}
        >
          {isTestingModel ? 'Verifica in corso...' : 'Salva Modifiche'}
        </Button>
      )}
    </div>
  );
};
