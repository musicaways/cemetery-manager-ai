import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "sonner";

export const AITab = () => {
  const [provider, setProvider] = useState("groq");
  const [model, setModel] = useState("mixtral-8x7b-32768");
  const [language, setLanguage] = useState("it");
  const [temperature, setTemperature] = useState(0.7);

  const handleProviderChange = (newProvider: string) => {
    if (!newProvider) return;
    setProvider(newProvider);
    switch (newProvider) {
      case "groq":
        setModel("mixtral-8x7b-32768");
        break;
      case "gemini":
        setModel("gemini-pro");
        break;
      case "ollama":
        setModel("llama2");
        break;
      case "perplexity":
        setModel("llama-3.1-sonar-small-128k-online");
        break;
    }
    toast.success(`Provider AI cambiato in ${newProvider}`);
  };

  const renderModelOptions = () => {
    switch (provider) {
      case "groq":
        return (
          <ToggleGroup 
            type="single" 
            value={model}
            onValueChange={(value) => value && setModel(value)}
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
            onValueChange={(value) => value && setModel(value)}
            className="flex flex-wrap gap-2"
          >
            <ToggleGroupItem value="gemini-pro" className="px-4 py-2 rounded-lg bg-[#1A1F2C] border border-white/10 data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all">
              Gemini Pro
            </ToggleGroupItem>
          </ToggleGroup>
        );
      case "ollama":
        return (
          <ToggleGroup 
            type="single" 
            value={model}
            onValueChange={(value) => value && setModel(value)}
            className="flex flex-wrap gap-2"
          >
            <ToggleGroupItem value="llama2" className="px-4 py-2 rounded-lg bg-[#1A1F2C] border border-white/10 data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all">
              Llama 2
            </ToggleGroupItem>
            <ToggleGroupItem value="mistral" className="px-4 py-2 rounded-lg bg-[#1A1F2C] border border-white/10 data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all">
              Mistral
            </ToggleGroupItem>
            <ToggleGroupItem value="codellama" className="px-4 py-2 rounded-lg bg-[#1A1F2C] border border-white/10 data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all">
              CodeLlama
            </ToggleGroupItem>
            <ToggleGroupItem value="neural-chat" className="px-4 py-2 rounded-lg bg-[#1A1F2C] border border-white/10 data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all">
              Neural Chat
            </ToggleGroupItem>
          </ToggleGroup>
        );
      case "perplexity":
        return (
          <ToggleGroup 
            type="single" 
            value={model}
            onValueChange={(value) => value && setModel(value)}
            className="flex flex-wrap gap-2"
          >
            <ToggleGroupItem value="llama-3.1-sonar-small-128k-online" className="px-4 py-2 rounded-lg bg-[#1A1F2C] border border-white/10 data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all">
              Llama 3.1 Sonar Small
            </ToggleGroupItem>
            <ToggleGroupItem value="llama-3.1-sonar-large-128k-online" className="px-4 py-2 rounded-lg bg-[#1A1F2C] border border-white/10 data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all">
              Llama 3.1 Sonar Large
            </ToggleGroupItem>
          </ToggleGroup>
        );
      default:
        return null;
    }
  };

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
        {renderModelOptions()}
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
    </div>
  );
};
