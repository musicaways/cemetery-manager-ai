
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MODEL_DESCRIPTIONS } from './ModelDescriptions';

interface ModelSelectorProps {
  provider: string;
  model: string;
  onModelChange: (value: string) => void;
}

export const ModelSelector = ({ provider, model, onModelChange }: ModelSelectorProps) => {
  const renderModelOptions = () => {
    switch(provider) {
      case "groq":
        return (
          <ToggleGroup 
            type="single" 
            value={model}
            onValueChange={(value) => value && onModelChange(value)}
            className="flex flex-wrap gap-2"
          >
            <ToggleGroupItem value="mixtral-8x7b-32768" className="px-4 py-2 rounded-lg bg-[#1A1F2C] border border-white/10 data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all">
              Mixtral 8x7B
            </ToggleGroupItem>
            <ToggleGroupItem value="llama2-70b-4096" className="px-4 py-2 rounded-lg bg-[#1A1F2C] border border-white/10 data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all">
              LLaMA2 70B
            </ToggleGroupItem>
          </ToggleGroup>
        );
      case "gemini":
        return (
          <ToggleGroup 
            type="single" 
            value={model}
            onValueChange={(value) => value && onModelChange(value)}
            className="flex flex-wrap gap-2"
          >
            <ToggleGroupItem value="gemini-pro" className="px-4 py-2 rounded-lg bg-[#1A1F2C] border border-white/10 data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all">
              Gemini Pro
            </ToggleGroupItem>
          </ToggleGroup>
        );
      case "huggingface":
        return (
          <ToggleGroup 
            type="single" 
            value={model}
            onValueChange={(value) => value && onModelChange(value)}
            className="flex flex-wrap gap-2"
          >
            <ToggleGroupItem value="mistralai/Mistral-7B-Instruct-v0.2" className="px-4 py-2 rounded-lg bg-[#1A1F2C] border border-white/10 data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all">
              Mistral 7B v0.2
            </ToggleGroupItem>
            <ToggleGroupItem value="meta-llama/Llama-2-70b-chat-hf" className="px-4 py-2 rounded-lg bg-[#1A1F2C] border border-white/10 data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all">
              LLaMA2 70B Chat
            </ToggleGroupItem>
            <ToggleGroupItem value="tiiuae/falcon-180B-chat" className="px-4 py-2 rounded-lg bg-[#1A1F2C] border border-white/10 data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all">
              Falcon 180B
            </ToggleGroupItem>
          </ToggleGroup>
        );
      default:
        return null;
    }
  };

  return renderModelOptions();
};
