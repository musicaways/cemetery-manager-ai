
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/themeContext";
import { toast } from "sonner";
import { useState } from "react";
import { MessageSquare, MessageCircle, Send, Plus, Settings2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    <div className="space-y-6">
      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="themes" className="border-none">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2 text-base font-semibold text-gray-200">
              <Settings2 className="w-4 h-4" />
              Seleziona Tema
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="relative aspect-[1.2/1] group cursor-pointer" onClick={() => handleThemeChange('lovable')}>
                <div className="absolute inset-0 rounded-lg overflow-hidden border border-white/10 transition-all duration-200 group-hover:border-[#9b87f5]">
                  <div className="h-full p-3 bg-[#1A1F2C]">
                    <div className="space-y-2">
                      <div className="w-2/3 h-3 bg-[#9b87f5]/20 rounded-lg" />
                      <div className="w-full h-3 bg-[#2A2F3C] rounded-lg" />
                      <div className="mt-auto pt-2">
                        <div className="h-8 bg-[#2A2F3C] rounded-lg flex items-center px-2 gap-2">
                          <Plus className="w-3 h-3 text-[#9b87f5]" />
                          <div className="flex-1 h-3 bg-[#3A3F4C] rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <span className="absolute bottom-2 left-3 text-sm font-medium text-gray-200">Lovable</span>
              </div>

              <div className="relative aspect-[1.2/1] group cursor-pointer" onClick={() => handleThemeChange('chatgpt')}>
                <div className="absolute inset-0 rounded-lg overflow-hidden border border-white/10 transition-all duration-200 group-hover:border-[#19C37D]">
                  <div className="h-full p-3 bg-[#343541]">
                    <div className="space-y-2">
                      <div className="w-2/3 h-3 bg-[#19C37D]/20 rounded" />
                      <div className="w-full h-3 bg-[#444654] rounded" />
                      <div className="mt-auto pt-2">
                        <div className="h-8 bg-[#40414F] rounded flex items-center px-2 gap-2">
                          <Plus className="w-3 h-3 text-[#19C37D]" />
                          <div className="flex-1 h-3 bg-[#565869] rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <span className="absolute bottom-2 left-3 text-sm font-medium text-gray-200">ChatGPT</span>
              </div>

              <div className="relative aspect-[1.2/1] group cursor-pointer" onClick={() => handleThemeChange('claude')}>
                <div className="absolute inset-0 rounded-lg overflow-hidden border border-gray-200 transition-all duration-200 group-hover:border-[#7C3AED]">
                  <div className="h-full p-3 bg-[#F9FAFB]">
                    <div className="space-y-2">
                      <div className="w-2/3 h-3 bg-[#7C3AED]/10 rounded-xl" />
                      <div className="w-full h-3 bg-white shadow-sm rounded-xl" />
                      <div className="mt-auto pt-2">
                        <div className="h-8 bg-white rounded-xl shadow-sm flex items-center px-2 gap-2">
                          <Plus className="w-3 h-3 text-[#7C3AED]" />
                          <div className="flex-1 h-3 bg-gray-100 rounded-lg" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <span className="absolute bottom-2 left-3 text-sm font-medium text-gray-900">Claude</span>
              </div>

              <div className="relative aspect-[1.2/1] group cursor-pointer" onClick={() => handleThemeChange('modern')}>
                <div className="absolute inset-0 rounded-lg overflow-hidden border border-white/10 transition-all duration-200 group-hover:border-[#2563EB]">
                  <div className="h-full p-3 bg-[#0F172A]">
                    <div className="space-y-2">
                      <div className="w-2/3 h-3 bg-[#2563EB]/20 rounded-2xl" />
                      <div className="w-full h-3 bg-[#1E293B] rounded-2xl" />
                      <div className="mt-auto pt-2">
                        <div className="h-8 bg-[#1E293B] rounded-2xl flex items-center px-2 gap-2">
                          <Plus className="w-3 h-3 text-[#2563EB]" />
                          <div className="flex-1 h-3 bg-[#334155] rounded-xl" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <span className="absolute bottom-2 left-3 text-sm font-medium text-gray-200">Modern</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="layout" className="border-none">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2 text-base font-semibold text-gray-200">
              <MessageSquare className="w-4 h-4" />
              Densità Layout
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <button
                onClick={() => handleChatStyleChange('modern')}
                className={`p-3 rounded-lg border transition-all ${
                  chatStyle === 'modern'
                    ? 'bg-[var(--primary-color)] border-[var(--primary-color)]'
                    : 'bg-[var(--message-bg)] border-[var(--border-color)]'
                }`}
              >
                <div className="space-y-2">
                  <div className="w-full h-3 bg-current opacity-20 rounded" />
                  <div className="w-2/3 h-3 bg-current opacity-20 rounded" />
                </div>
                <span className="text-xs font-medium mt-2 block">Comodo</span>
              </button>

              <button
                onClick={() => handleChatStyleChange('classic')}
                className={`p-3 rounded-lg border transition-all ${
                  chatStyle === 'classic'
                    ? 'bg-[var(--primary-color)] border-[var(--primary-color)]'
                    : 'bg-[var(--message-bg)] border-[var(--border-color)]'
                }`}
              >
                <div className="space-y-1">
                  <div className="w-full h-2 bg-current opacity-20 rounded" />
                  <div className="w-2/3 h-2 bg-current opacity-20 rounded" />
                  <div className="w-1/2 h-2 bg-current opacity-20 rounded" />
                </div>
                <span className="text-xs font-medium mt-2 block">Classico</span>
              </button>

              <button
                onClick={() => handleChatStyleChange('compact')}
                className={`p-3 rounded-lg border transition-all ${
                  chatStyle === 'compact'
                    ? 'bg-[var(--primary-color)] border-[var(--primary-color)]'
                    : 'bg-[var(--message-bg)] border-[var(--border-color)]'
                }`}
              >
                <div className="space-y-1">
                  <div className="w-full h-1.5 bg-current opacity-20 rounded" />
                  <div className="w-2/3 h-1.5 bg-current opacity-20 rounded" />
                  <div className="w-1/2 h-1.5 bg-current opacity-20 rounded" />
                  <div className="w-1/3 h-1.5 bg-current opacity-20 rounded" />
                </div>
                <span className="text-xs font-medium mt-2 block">Compatto</span>
              </button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="avatar" className="border-none">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2 text-base font-semibold text-gray-200">
              <MessageCircle className="w-4 h-4" />
              Forma Avatar
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <button
                onClick={() => handleAvatarShapeChange('circle')}
                className={`aspect-square p-4 rounded-lg border transition-all ${
                  avatarShape === 'circle'
                    ? 'bg-[var(--primary-color)] border-[var(--primary-color)]'
                    : 'bg-[var(--message-bg)] border-[var(--border-color)]'
                }`}
              >
                <div className="w-full h-full rounded-full bg-current opacity-20" />
              </button>

              <button
                onClick={() => handleAvatarShapeChange('square')}
                className={`aspect-square p-4 rounded-lg border transition-all ${
                  avatarShape === 'square'
                    ? 'bg-[var(--primary-color)] border-[var(--primary-color)]'
                    : 'bg-[var(--message-bg)] border-[var(--border-color)]'
                }`}
              >
                <div className="w-full h-full rounded-lg bg-current opacity-20" />
              </button>

              <button
                onClick={() => handleAvatarShapeChange('hexagon')}
                className={`aspect-square p-4 rounded-lg border transition-all ${
                  avatarShape === 'hexagon'
                    ? 'bg-[var(--primary-color)] border-[var(--primary-color)]'
                    : 'bg-[var(--message-bg)] border-[var(--border-color)]'
                }`}
              >
                <div 
                  className="w-full h-full bg-current opacity-20"
                  style={{
                    clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"
                  }}
                />
              </button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {hasChanges && (
        <Button onClick={saveSettings} className="w-full">
          Salva Modifiche
        </Button>
      )}
    </div>
  );
};
