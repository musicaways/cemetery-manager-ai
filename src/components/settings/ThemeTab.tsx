
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/themeContext";
import { toast } from "sonner";
import { useState } from "react";

interface ThemeTabProps {
  onSave: () => void;
}

export const ThemeTab = ({ onSave }: ThemeTabProps) => {
  const { chatStyle, setChatStyle, avatarShape, setAvatarShape } = useTheme();
  const [hasChanges, setHasChanges] = useState(false);

  const handleThemeChange = (newTheme: string) => {
    if (!newTheme) return;
    const themeColors = getThemeColors(newTheme);
    document.documentElement.style.setProperty('--primary-color', themeColors.primary);
    document.documentElement.style.setProperty('--primary-hover', themeColors.hover);
    document.documentElement.style.setProperty('--chat-bg', themeColors.chatBg);
    document.documentElement.style.setProperty('--message-bg', themeColors.messageBg);
    document.documentElement.style.setProperty('--border-color', themeColors.border);
    setHasChanges(true);
  };

  const handleChatStyleChange = (newStyle: string) => {
    if (!newStyle) return;
    setChatStyle(newStyle);
    setHasChanges(true);
  };

  const handleAvatarShapeChange = (newShape: string) => {
    if (!newShape) return;
    setAvatarShape(newShape);
    setHasChanges(true);
  };

  const saveSettings = () => {
    localStorage.setItem('theme_chat_style', chatStyle);
    localStorage.setItem('theme_avatar_shape', avatarShape);
    setHasChanges(false);
    toast.success('Impostazioni tema salvate con successo');
    onSave();
  };

  const getThemeColors = (theme: string) => {
    switch (theme) {
      case "lovable":
        return {
          primary: "#9b87f5",
          hover: "#7E69AB",
          chatBg: "#1A1F2C",
          messageBg: "#2A2F3C",
          border: "#3A3F4C"
        };
      case "chatgpt":
        return {
          primary: "#19C37D",
          hover: "#127C54",
          chatBg: "#343541",
          messageBg: "#444654",
          border: "#565869"
        };
      case "claude":
        return {
          primary: "#7C3AED",
          hover: "#6D28D9",
          chatBg: "#F9FAFB",
          messageBg: "#F3F4F6",
          border: "#E5E7EB"
        };
      case "modern":
        return {
          primary: "#2563EB",
          hover: "#1D4ED8",
          chatBg: "#0F172A",
          messageBg: "#1E293B",
          border: "#334155"
        };
      default:
        return {
          primary: "#9b87f5",
          hover: "#7E69AB",
          chatBg: "#1A1F2C",
          messageBg: "#2A2F3C",
          border: "#3A3F4C"
        };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Seleziona Tema
        </label>
        <ToggleGroup 
          type="single" 
          defaultValue="lovable"
          onValueChange={handleThemeChange}
          className="grid grid-cols-2 gap-2"
        >
          <ToggleGroupItem value="lovable" className="aspect-video p-4 rounded-lg bg-[#1A1F2C] border border-white/10 data-[state=on]:border-[#9b87f5] transition-all flex flex-col items-center justify-center gap-2">
            <div className="w-full h-3 bg-[#9b87f5] rounded" />
            <span className="text-sm">Lovable</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="chatgpt" className="aspect-video p-4 rounded-lg bg-[#343541] border border-white/10 data-[state=on]:border-[#19C37D] transition-all flex flex-col items-center justify-center gap-2">
            <div className="w-full h-3 bg-[#19C37D] rounded" />
            <span className="text-sm">ChatGPT</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="claude" className="aspect-video p-4 rounded-lg bg-[#F9FAFB] border border-gray-200 data-[state=on]:border-[#7C3AED] transition-all flex flex-col items-center justify-center gap-2">
            <div className="w-full h-3 bg-[#7C3AED] rounded" />
            <span className="text-sm text-gray-900">Claude</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="modern" className="aspect-video p-4 rounded-lg bg-[#0F172A] border border-white/10 data-[state=on]:border-[#2563EB] transition-all flex flex-col items-center justify-center gap-2">
            <div className="w-full h-3 bg-[#2563EB] rounded" />
            <span className="text-sm">Modern</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Densità Layout
        </label>
        <ToggleGroup 
          type="single" 
          value={chatStyle}
          onValueChange={(value) => {
            if (value) {
              handleChatStyleChange(value);
            }
          }}
          className="flex flex-wrap gap-2"
        >
          <ToggleGroupItem value="modern" className="px-4 py-2 rounded-lg bg-[#1A1F2C] border border-white/10 data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all">
            Comodo
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
          onValueChange={(value) => {
            if (value) {
              handleAvatarShapeChange(value);
            }
          }}
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

      {hasChanges && (
        <Button onClick={saveSettings} className="w-full">
          Salva Modifiche
        </Button>
      )}
    </div>
  );
};
