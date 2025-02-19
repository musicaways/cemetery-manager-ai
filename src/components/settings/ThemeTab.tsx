
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/themeContext";
import { toast } from "sonner";
import { useState } from "react";
import { MessageSquare, MessageCircle } from "lucide-react";
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
  const { theme, setTheme, avatarShape, setAvatarShape } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(theme);
  const [selectedAvatarShape, setSelectedAvatarShape] = useState(avatarShape);
  const [hasChanges, setHasChanges] = useState(false);

  const handleThemeChange = (newTheme: string) => {
    if (!newTheme) return;
    setSelectedTheme(newTheme as 'modern' | 'chatgpt');
    setHasChanges(true);
  };

  const handleAvatarShapeChange = (newShape: string) => {
    if (!newShape) return;
    setSelectedAvatarShape(newShape);
    setHasChanges(true);
  };

  const saveSettings = () => {
    setTheme(selectedTheme);
    setAvatarShape(selectedAvatarShape);
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
              <MessageSquare className="w-4 h-4" />
              Seleziona Tema
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => handleThemeChange('modern')}
                className={`p-3 rounded-lg border transition-all ${
                  selectedTheme === 'modern'
                    ? 'bg-primary border-primary'
                    : 'bg-secondary border-border'
                }`}
              >
                <div className="space-y-2">
                  <div className="w-full h-3 bg-current opacity-20 rounded" />
                  <div className="w-2/3 h-3 bg-current opacity-20 rounded" />
                </div>
                <span className="text-xs font-medium mt-2 block">Moderno</span>
              </button>

              <button
                onClick={() => handleThemeChange('chatgpt')}
                className={`p-3 rounded-lg border transition-all ${
                  selectedTheme === 'chatgpt'
                    ? 'bg-primary border-primary'
                    : 'bg-secondary border-border'
                }`}
              >
                <div className="space-y-2">
                  <div className="w-full h-3 bg-current opacity-20 rounded" />
                  <div className="w-2/3 h-3 bg-current opacity-20 rounded" />
                </div>
                <span className="text-xs font-medium mt-2 block">ChatGPT</span>
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
                  selectedAvatarShape === 'circle'
                    ? 'bg-primary border-primary'
                    : 'bg-secondary border-border'
                }`}
              >
                <div className="w-full h-full rounded-full bg-current opacity-20" />
              </button>

              <button
                onClick={() => handleAvatarShapeChange('square')}
                className={`aspect-square p-4 rounded-lg border transition-all ${
                  selectedAvatarShape === 'square'
                    ? 'bg-primary border-primary'
                    : 'bg-secondary border-border'
                }`}
              >
                <div className="w-full h-full rounded-lg bg-current opacity-20" />
              </button>

              <button
                onClick={() => handleAvatarShapeChange('hexagon')}
                className={`aspect-square p-4 rounded-lg border transition-all ${
                  selectedAvatarShape === 'hexagon'
                    ? 'bg-primary border-primary'
                    : 'bg-secondary border-border'
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
