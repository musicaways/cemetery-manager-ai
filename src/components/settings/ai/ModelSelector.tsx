
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MODEL_DESCRIPTIONS } from './ModelDescriptions';
import { Brain, Sparkles, Cpu } from "lucide-react";

interface ModelSelectorProps {
  provider: string;
  model: string;
  onModelChange: (value: string) => void;
}

export const ModelSelector = ({ provider, model, onModelChange }: ModelSelectorProps) => {
  const renderModelCard = (modelId: string, name: string, description: string) => (
    <div 
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        model === modelId 
          ? 'bg-[var(--primary-color)] border-[var(--primary-color)]' 
          : 'bg-[var(--message-bg)] border-[var(--border-color)] hover:border-[var(--primary-color)] hover:border-opacity-50'
      }`}
      onClick={() => onModelChange(modelId)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {modelId.includes('mixtral') ? (
            <Brain className="w-5 h-5 text-[var(--primary-color)]" />
          ) : modelId.includes('llama') ? (
            <Sparkles className="w-5 h-5 text-[var(--primary-color)]" />
          ) : (
            <Cpu className="w-5 h-5 text-[var(--primary-color)]" />
          )}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-200">{name}</h3>
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );

  const renderModelOptions = () => {
    switch(provider) {
      case "groq":
        return (
          <div className="space-y-3">
            {renderModelCard(
              "mixtral-8x7b-32768",
              "Mixtral 8x7B",
              "Modello di ultima generazione con prestazioni eccezionali in vari compiti. Supporta un contesto molto ampio di 32K token."
            )}
            {renderModelCard(
              "llama2-70b-4096",
              "LLaMA2 70B",
              "Modello potente e versatile, ottimo per compiti di comprensione e generazione del linguaggio naturale."
            )}
          </div>
        );
      case "gemini":
        return (
          <div className="space-y-3">
            {renderModelCard(
              "gemini-pro",
              "Gemini Pro",
              "Modello all'avanguardia di Google, eccellente per analisi multimodale e comprensione profonda del contesto."
            )}
          </div>
        );
      case "huggingface":
        return (
          <div className="space-y-3">
            {renderModelCard(
              "gpt2-large",
              "GPT-2 Large",
              "Modello base affidabile, ideale per compiti di generazione di testo e completamento."
            )}
            {renderModelCard(
              "facebook/opt-1.3b",
              "OPT 1.3B",
              "Modello equilibrato di Meta, ottimo per chat generali e analisi di testo."
            )}
            {renderModelCard(
              "bigscience/bloom-560m",
              "BLOOM 560M",
              "Modello leggero multilingue, perfetto per elaborazioni rapide in diverse lingue."
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return renderModelOptions();
};
