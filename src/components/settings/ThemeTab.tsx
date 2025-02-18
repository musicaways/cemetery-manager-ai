import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTheme } from "@/lib/themeContext";
import { toast } from "sonner";
import { useState } from "react";

export const ThemeTab = () => {
  const { chatStyle, setChatStyle, avatarShape, setAvatarShape } = useTheme();
  const [hasChanges, setHasChanges] = useState(false);

  const handleThemeChange = (newTheme: string) => {
    if (!newTheme) return;
    document.documentElement.style.setProperty('--primary-color', getThemeColor(newTheme));
    document.documentElement.style.setProperty('--primary-hover', getThemeHoverColor(newTheme));
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

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Tema Colori
        </label>
        <ToggleGroup 
          type="single" 
          defaultValue="purple"
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
          onValueChange={(value) => {
            if (value) {
              handleChatStyleChange(value);
              toast.success(`Stile chat cambiato in ${value}`);
            }
          }}
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
          onValueChange={(value) => {
            if (value) {
              handleAvatarShapeChange(value);
              toast.success(`Forma avatar cambiata in ${value}`);
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
