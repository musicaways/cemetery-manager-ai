
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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

  return (
    <div className="space-y-6">
      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="provider" className="border-none">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2 text-base font-semibold text-gray-200">
              <Bot className="w-4 h-4" />
              Provider AI
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <button
                onClick={() => handleProviderChange('groq')}
                className={`p-4 rounded-lg border transition-all ${
                  provider === 'groq'
                    ? 'bg-[var(--primary-color)] border-[var(--primary-color)]'
                    : 'bg-[var(--message-bg)] border-[var(--border-color)]'
                }`}
              >
                <Cpu className="w-5 h-5 mx-auto mb-2" />
                <span className="text-sm font-medium block">Groq</span>
              </button>

              <button
                onClick={() => handleProviderChange('gemini')}
                className={`p-4 rounded-lg border transition-all ${
                  provider === 'gemini'
                    ? 'bg-[var(--primary-color)] border-[var(--primary-color)]'
                    : 'bg-[var(--message-bg)] border-[var(--border-color)]'
                }`}
              >
                <Bot className="w-5 h-5 mx-auto mb-2" />
                <span className="text-sm font-medium block">Gemini</span>
              </button>

              <button
                onClick={() => handleProviderChange('huggingface')}
                className={`p-4 rounded-lg border transition-all ${
                  provider === 'huggingface'
                    ? 'bg-[var(--primary-color)] border-[var(--primary-color)]'
                    : 'bg-[var(--message-bg)] border-[var(--border-color)]'
                }`}
              >
                <Bot className="w-5 h-5 mx-auto mb-2" />
                <span className="text-sm font-medium block">HuggingFace</span>
              </button>
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
