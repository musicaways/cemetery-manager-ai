
import { useState } from "react";
import { Settings, X, Palette, Bot, Key } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeTab } from "./settings/ThemeTab";
import { AITab } from "./settings/AITab";
import { APIKeysTab } from "./settings/APIKeysTab";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AISettings = ({ isOpen, onClose }: SettingsProps) => {
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

        <Tabs defaultValue="theme" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-[#1A1F2C]">
            <TabsTrigger value="theme" className="data-[state=active]:bg-[var(--primary-color)]">
              <Palette className="w-4 h-4 mr-2" />
              Tema
            </TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-[var(--primary-color)]">
              <Bot className="w-4 h-4 mr-2" />
              AI
            </TabsTrigger>
            <TabsTrigger value="keys" className="data-[state=active]:bg-[var(--primary-color)]">
              <Key className="w-4 h-4 mr-2" />
              API Keys
            </TabsTrigger>
          </TabsList>

          <TabsContent value="theme">
            <ThemeTab onSave={onClose} />
          </TabsContent>

          <TabsContent value="ai">
            <AITab onSave={onClose} />
          </TabsContent>

          <TabsContent value="keys">
            <APIKeysTab onSave={onClose} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
