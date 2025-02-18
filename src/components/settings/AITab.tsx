
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { useAISettings } from './ai/useAISettings';
import { ModelSelector } from './ai/ModelSelector';

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
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Provider AI
        </label>
        <ToggleGroup 
          type="single" 
          value={provider}
          onValueChange={handleProviderChange}
          className="flex flex-wrap gap-2"
        >
          <ToggleGroupItem value="groq" className="px-4 py-2 rounded-lg bg-[#1A1F2C] border border-white/10 data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all">
            Groq
          </ToggleGroupItem>
          <ToggleGroupItem value="gemini" className="px-4 py-2 rounded-lg bg-[#1A1F2C] border border-white/10 data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all">
            Gemini
          </ToggleGroupItem>
          <ToggleGroupItem value="ollama" className="px-4 py-2 rounded-lg bg-[#1A1F2C] border border-white/10 data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all">
            Ollama
          </ToggleGroupItem>
          <ToggleGroupItem value="perplexity" className="px-4 py-2 rounded-lg bg-[#1A1F2C] border border-white/10 data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all">
            Perplexity
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Modello
        </label>
        <ModelSelector 
          provider={provider} 
          model={model} 
          onModelChange={handleModelChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Lingua
        </label>
        <ToggleGroup 
          type="single" 
          value={language}
          onValueChange={(value) => value && setLanguage(value)}
          className="flex flex-wrap gap-2"
        >
          <ToggleGroupItem value="it" className="px-4 py-2 rounded-lg bg-[#1A1F2C] border border-white/10 data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all">
            Italiano
          </ToggleGroupItem>
          <ToggleGroupItem value="en" className="px-4 py-2 rounded-lg bg-[#1A1F2C] border border-white/10 data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all">
            English
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Temperatura (Creatività)
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          className="w-full h-2 bg-[#1A1F2C] rounded-lg appearance-none cursor-pointer accent-[var(--primary-color)]"
        />
        <div className="flex justify-between text-sm text-gray-400 mt-1">
          <span>Preciso</span>
          <span>Creativo</span>
        </div>
      </div>

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
