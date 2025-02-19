
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/themeContext";
import { toast } from "sonner";
import { useState } from "react";
import { MessageSquare, MessageCircle, Send, Plus } from "lucide-react";

interface ThemeTabProps {
  onSave: () => void;
}

export const ThemeTab = ({ onSave }: ThemeTabProps) => {
  const { chatStyle, setChatStyle, avatarShape, setAvatarShape } = useTheme();
  const [hasChanges, setHasChanges] = useState(false);

  const handleThemeChange = (newTheme: string) => {
    if (!newTheme) return;
    document.body.className = `theme-${newTheme} chat-${chatStyle}`;
    setHasChanges(true);
  };

  const handleChatStyleChange = (newStyle: string) => {
    if (!newStyle) return;
    setChatStyle(newStyle);
    document.body.className = document.body.className.replace(/chat-\w+/, `chat-${newStyle}`);
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

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-4">
          Seleziona Tema
        </h3>
        <ToggleGroup 
          type="single" 
          defaultValue="lovable"
          onValueChange={handleThemeChange}
          className="grid grid-cols-2 gap-4"
        >
          <ToggleGroupItem 
            value="lovable" 
            className="aspect-[1.4/1] relative p-4 rounded-xl bg-[#1A1F2C] border border-white/10 data-[state=on]:border-[#9b87f5] transition-all"
          >
            <div className="absolute inset-0 p-3">
              <div className="h-full flex flex-col">
                <div className="flex-1 flex flex-col gap-2">
                  <div className="w-3/4 h-8 bg-[#2A2F3C] rounded-lg opacity-50" />
                  <div className="w-1/2 h-8 bg-[#9b87f5]/30 rounded-lg self-end" />
                </div>
                <div className="h-10 bg-[#2A2F3C] rounded-lg mt-2 flex items-center px-3 gap-2">
                  <Plus className="w-4 h-4 text-[#9b87f5]" />
                  <div className="flex-1 h-5 bg-[#3A3F4C] rounded" />
                  <MessageCircle className="w-4 h-4 text-[#9b87f5]" />
                </div>
              </div>
            </div>
            <div className="absolute bottom-2 left-4 text-sm font-medium text-gray-200">
              Lovable
            </div>
          </ToggleGroupItem>

          <ToggleGroupItem 
            value="chatgpt" 
            className="aspect-[1.4/1] relative p-4 rounded-xl bg-[#343541] border border-white/10 data-[state=on]:border-[#19C37D] transition-all"
          >
            <div className="absolute inset-0 p-3">
              <div className="h-full flex flex-col">
                <div className="flex-1 flex flex-col gap-2">
                  <div className="w-3/4 h-8 bg-[#444654] rounded opacity-50" />
                  <div className="w-1/2 h-8 bg-[#19C37D]/20 rounded self-end" />
                </div>
                <div className="h-10 bg-[#40414F] rounded-md mt-2 flex items-center px-3 gap-2">
                  <Plus className="w-4 h-4 text-[#19C37D]" />
                  <div className="flex-1 h-5 bg-[#565869] rounded" />
                  <Send className="w-4 h-4 text-[#19C37D]" />
                </div>
              </div>
            </div>
            <div className="absolute bottom-2 left-4 text-sm font-medium text-gray-200">
              ChatGPT
            </div>
          </ToggleGroupItem>

          <ToggleGroupItem 
            value="claude" 
            className="aspect-[1.4/1] relative p-4 rounded-xl bg-[#F9FAFB] border border-gray-200 data-[state=on]:border-[#7C3AED] transition-all"
          >
            <div className="absolute inset-0 p-3">
              <div className="h-full flex flex-col">
                <div className="flex-1 flex flex-col gap-2">
                  <div className="w-3/4 h-8 bg-white rounded-xl shadow-sm opacity-50" />
                  <div className="w-1/2 h-8 bg-[#7C3AED]/10 rounded-xl self-end" />
                </div>
                <div className="h-10 bg-white rounded-xl shadow-sm mt-2 flex items-center px-3 gap-2">
                  <Plus className="w-4 h-4 text-[#7C3AED]" />
                  <div className="flex-1 h-5 bg-gray-100 rounded-lg" />
                  <MessageSquare className="w-4 h-4 text-[#7C3AED]" />
                </div>
              </div>
            </div>
            <div className="absolute bottom-2 left-4 text-sm font-medium text-gray-900">
              Claude
            </div>
          </ToggleGroupItem>

          <ToggleGroupItem 
            value="modern" 
            className="aspect-[1.4/1] relative p-4 rounded-xl bg-[#0F172A] border border-white/10 data-[state=on]:border-[#2563EB] transition-all"
          >
            <div className="absolute inset-0 p-3">
              <div className="h-full flex flex-col">
                <div className="flex-1 flex flex-col gap-2">
                  <div className="w-3/4 h-8 bg-[#1E293B] rounded-2xl opacity-50" />
                  <div className="w-1/2 h-8 bg-[#2563EB]/20 rounded-2xl self-end" />
                </div>
                <div className="h-10 bg-[#1E293B] rounded-2xl mt-2 flex items-center px-3 gap-2">
                  <Plus className="w-4 h-4 text-[#2563EB]" />
                  <div className="flex-1 h-5 bg-[#334155] rounded-xl" />
                  <MessageCircle className="w-4 h-4 text-[#2563EB]" />
                </div>
              </div>
            </div>
            <div className="absolute bottom-2 left-4 text-sm font-medium text-gray-200">
              Modern
            </div>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-4">
          Densità Layout
        </h3>
        <ToggleGroup 
          type="single" 
          value={chatStyle}
          onValueChange={(value) => {
            if (value) {
              handleChatStyleChange(value);
            }
          }}
          className="grid grid-cols-3 gap-4"
        >
          <ToggleGroupItem 
            value="modern" 
            className="p-4 rounded-lg bg-[var(--message-bg)] border border-[var(--border-color)] data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all"
          >
            <div className="space-y-2">
              <div className="w-full h-6 bg-current opacity-20 rounded" />
              <div className="w-2/3 h-6 bg-current opacity-20 rounded" />
            </div>
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="classic" 
            className="p-4 rounded-lg bg-[var(--message-bg)] border border-[var(--border-color)] data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all"
          >
            <div className="space-y-1">
              <div className="w-full h-4 bg-current opacity-20 rounded" />
              <div className="w-2/3 h-4 bg-current opacity-20 rounded" />
              <div className="w-1/2 h-4 bg-current opacity-20 rounded" />
            </div>
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="compact" 
            className="p-4 rounded-lg bg-[var(--message-bg)] border border-[var(--border-color)] data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all"
          >
            <div className="space-y-1">
              <div className="w-full h-3 bg-current opacity-20 rounded" />
              <div className="w-2/3 h-3 bg-current opacity-20 rounded" />
              <div className="w-1/2 h-3 bg-current opacity-20 rounded" />
              <div className="w-1/3 h-3 bg-current opacity-20 rounded" />
            </div>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-200 mb-4">
          Forma Avatar
        </h3>
        <ToggleGroup 
          type="single" 
          value={avatarShape}
          onValueChange={(value) => {
            if (value) {
              handleAvatarShapeChange(value);
            }
          }}
          className="grid grid-cols-3 gap-4"
        >
          <ToggleGroupItem 
            value="circle" 
            className="aspect-square p-4 rounded-lg bg-[var(--message-bg)] border border-[var(--border-color)] data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all"
          >
            <div className="w-full h-full rounded-full bg-current opacity-20" />
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="square" 
            className="aspect-square p-4 rounded-lg bg-[var(--message-bg)] border border-[var(--border-color)] data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all"
          >
            <div className="w-full h-full rounded-lg bg-current opacity-20" />
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="hexagon" 
            className="aspect-square p-4 rounded-lg bg-[var(--message-bg)] border border-[var(--border-color)] data-[state=on]:bg-[var(--primary-color)] data-[state=on]:border-[var(--primary-color)] transition-all"
          >
            <div className="w-full h-full bg-current opacity-20" style={{
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
            }} />
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
