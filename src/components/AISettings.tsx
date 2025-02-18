
import { useState } from "react";
import { Settings, X, Sun, Moon, Palette } from "lucide-react";
import { toast } from "sonner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AISettings = ({ isOpen, onClose }: SettingsProps) => {
  const [theme, setTheme] = useState("blue");
  const [chatStyle, setChatStyle] = useState("modern");

  const handleThemeChange = (newTheme: string) => {
    if (!newTheme) return;
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    toast.success(`Tema cambiato in ${newTheme}`);
  };

  const handleChatStyleChange = (newStyle: string) => {
    if (!newStyle) return;
    setChatStyle(newStyle);
    toast.success(`Stile chat cambiato in ${newStyle}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[var(--message-bg)] rounded-lg p-6 max-w-md w-full mx-4 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Impostazioni</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
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
              <ToggleGroupItem value="blue" className="data-[state=on]:bg-blue-500">
                <div className="w-8 h-8 bg-blue-500 rounded-full" />
              </ToggleGroupItem>
              <ToggleGroupItem value="green" className="data-[state=on]:bg-green-500">
                <div className="w-8 h-8 bg-green-500 rounded-full" />
              </ToggleGroupItem>
              <ToggleGroupItem value="red" className="data-[state=on]:bg-red-500">
                <div className="w-8 h-8 bg-red-500 rounded-full" />
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
              <ToggleGroupItem value="modern" className="px-4 py-2 data-[state=on]:bg-[var(--primary-color)]">
                Moderno
              </ToggleGroupItem>
              <ToggleGroupItem value="classic" className="px-4 py-2 data-[state=on]:bg-[var(--primary-color)]">
                Classico
              </ToggleGroupItem>
              <ToggleGroupItem value="compact" className="px-4 py-2 data-[state=on]:bg-[var(--primary-color)]">
                Compatto
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>
    </div>
  );
};
