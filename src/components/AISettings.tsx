import { useState } from "react";
import { Settings, X, Sun, Moon, Palette } from "lucide-react";
import { toast } from "sonner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from '@/lib/themeContext';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AISettings = ({ isOpen, onClose }: SettingsProps) => {
  const { chatStyle, setChatStyle, avatarShape, setAvatarShape } = useTheme();
  const [theme, setTheme] = useState("purple");
  const [temperature, setTemperature] = useState(0.7);
  const [provider, setProvider] = useState("groq");
  const [model, setModel] = useState("mixtral-8x7b-32768");
  const [language, setLanguage] = useState("it");

  const handleThemeChange = (newTheme: string) => {
    if (!newTheme) return;
    setTheme(newTheme);
    document.documentElement.style.setProperty('--primary-color', getThemeColor(newTheme));
    document.documentElement.style.setProperty('--primary-hover', getThemeHoverColor(newTheme));
    toast.success(`Tema cambiato in ${newTheme}`);
  };

  const handleProviderChange = (newProvider: string) => {
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

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    toast.success(`Modello cambiato in ${newModel}`);
  };

  const handleChatStyleChange = (newStyle: string) => {
    if (!newStyle) return;
    setChatStyle(newStyle);
    toast.success(`Stile chat cambiato in ${newStyle}`);
  };

  const handleAvatarShapeChange = (newShape: string) => {
    if (!newShape) return;
    setAvatarShape(newShape);
    toast.success(`Forma avatar cambiata in ${newShape}`);
  };

  const getThemeColor = (theme: string) => {
    switch (theme) {
      case "purple": return "#9b87f5";
      case "blue": return "#2563eb";
      case "green": return "#059669";
      case "red": return "#dc2626";
      default: return "#9b87f5";
    }
  };

  const getThemeHoverColor = (theme: string) => {
    switch (theme) {
      case "purple": return "#7E69AB";
      case "blue": return "#1d4ed8";
      case "green": return "#047857";
      case "red": return "#b91c1c";
      default: return "#7E69AB";
    }
  };

  const renderModelOptions = () => {
    switch (provider) {
      case "groq":
        return (
          <ToggleGroup 
            type="single" 
            value={model}
            onValueChange={(value) => value && handleModelChange(value)}
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
            onValueChange={(value) => value && handleModelChange(value)}
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
            onValueChange={(value) => value && handleModelChange(value)}
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
            onValueChange={(value) => value && handleModelChange(value)}
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#2A2F3C] rounded-xl p-6 max-w-md w-full mx-4 space-y-6 shadow-lg border border-white/10">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Impostazioni</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Tema Colori
            </label>
            <ToggleGroup 
              type="single" 
              value={theme}
              onValueChange={handleThemeChange}
              className="flex flex-wrap gap-2"
            >
              <ToggleGroupItem value="purple" className="p-1 rounded-lg transition-all data-[state=on]:ring-2 data-[state=on]:ring-[#9b87f5] data-[state=on]:ring-offset-2 data-[state=on]:ring-offset-[#2A2F3C]">
                <div className="w-8 h-8 bg-[#9b87f5] rounded-md" />
              </ToggleGroupItem>
              <ToggleGroupItem value="blue" className="p-1 rounded-lg transition-all data-[state=on]:ring-2 data-[state=on]:ring-blue-500 data-[state=on]:ring-offset-2 data-[state=on]:ring-offset-[#2A2F3C]">
                <div className="w-8 h-8 bg-blue-500 rounded-md" />
              </ToggleGroupItem>
              <ToggleGroupItem value="green" className="p-1 rounded-lg transition-all data-[state=on]:ring-2 data-[state=on]:ring-green-500 data-[state=on]:ring-offset-2 data-[state=on]:ring-offset-[#2A2F3C]">
                <div className="w-8 h-8 bg-green-500 rounded-md" />
              </ToggleGroupItem>
              <ToggleGroupItem value="red" className="p-1 rounded-lg transition-all data-[state=on]:ring-2 data-[state=on]:ring-red-500 data-[state=on]:ring-offset-2 data-[state=on]:ring-offset-[#2A2F3C]">
                <div className="w-8 h-8 bg-red-500 rounded-md" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Stile Chat
            </label>
            <ToggleGroup 
              type="single" 
              value={chatStyle}
              onValueChange={handleChatStyleChange}
              className="flex flex-wrap gap-2"
            >
              <ToggleGroupItem value="modern" className="px-4 py-2 rounded-lg bg-[#1A1F2C] border border-white/10 data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all">
                Moderno
              </ToggleGroupItem>
              <ToggleGroupItem value="classic" className="px-4 py-2 rounded-lg bg-[#1A1F2C] border border-white/10 data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all">
                Classico
              </ToggleGroupItem>
              <ToggleGroupItem value="compact" className="px-4 py-2 rounded-lg bg-[#1A1F2C] border border-white/10 data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all">
                Compatto
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Forma Avatar
            </label>
            <ToggleGroup 
              type="single" 
              value={avatarShape}
              onValueChange={handleAvatarShapeChange}
              className="flex flex-wrap gap-2"
            >
              <ToggleGroupItem value="circle" className="px-4 py-2 rounded-lg bg-[#1A1F2C] border border-white/10 data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all">
                Tondo
              </ToggleGroupItem>
              <ToggleGroupItem value="square" className="px-4 py-2 rounded-lg bg-[#1A1F2C] border border-white/10 data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all">
                Quadrato
              </ToggleGroupItem>
              <ToggleGroupItem value="hexagon" className="px-4 py-2 rounded-lg bg-[#1A1F2C] border border-white/10 data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all">
                Esagono
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Impostazioni AI</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Provider AI
              </label>
              <ToggleGroup 
                type="single" 
                value={provider}
                onValueChange={(value) => value && handleProviderChange(value)}
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
        </div>
      </div>
    </div>
  );
};
