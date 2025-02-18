
import { useEffect, useState } from "react";
import { Settings, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type AIProvider = "groq" | "gemini" | "deepseek";
type GroqModel = "mixtral-8x7b-32768" | "llama2-70b-4096" | "gemma-7b-it";
type Language = "it" | "en";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AISettings = ({ isOpen, onClose }: SettingsProps) => {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>("groq");
  const [selectedModel, setSelectedModel] = useState<GroqModel>("mixtral-8x7b-32768");
  const [language, setLanguage] = useState<Language>("it");
  const [temperature, setTemperature] = useState(0.7);

  const handleProviderChange = async (provider: AIProvider) => {
    try {
      const { data, error } = await supabase.functions.invoke('update-ai-provider', {
        body: { 
          provider,
          model: selectedModel,
          language,
          temperature
        }
      });
      
      if (error) throw error;
      toast.success(`Impostazioni AI aggiornate`);
      
    } catch (error) {
      toast.error("Errore durante l'aggiornamento delle impostazioni");
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Impostazioni AI</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Provider AI
            </label>
            <select
              value={selectedProvider}
              onChange={(e) => {
                setSelectedProvider(e.target.value as AIProvider);
                handleProviderChange(e.target.value as AIProvider);
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="groq">Groq (Raccomandato)</option>
              <option value="gemini">Gemini</option>
              <option value="deepseek">DeepSeek</option>
            </select>
            <p className="mt-1 text-sm text-gray-400">
              Groq offre la migliore combinazione di velocità e qualità per il nostro caso d'uso
            </p>
          </div>

          {selectedProvider === "groq" && (
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Modello Linguistico
              </label>
              <select
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value as GroqModel);
                  handleProviderChange(selectedProvider);
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="mixtral-8x7b-32768">Mixtral 8x7B (Raccomandato)</option>
                <option value="llama2-70b-4096">LLaMA2 70B</option>
                <option value="gemma-7b-it">Gemma 7B (Italiano)</option>
              </select>
              <p className="mt-1 text-sm text-gray-400">
                Mixtral offre il miglior equilibrio tra performance e capacità in italiano
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Lingua Principale
            </label>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value as Language);
                handleProviderChange(selectedProvider);
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="it">Italiano</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Creatività (Temperature)
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => {
                setTemperature(parseFloat(e.target.value));
                handleProviderChange(selectedProvider);
              }}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-400">
              <span>Preciso</span>
              <span>{temperature}</span>
              <span>Creativo</span>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2 pt-4 border-t border-gray-700">
            <button
              onClick={() => window.open('https://console.groq.com', '_blank')}
              className="text-blue-400 hover:text-blue-300 text-sm text-left"
            >
              Ottieni Groq API Key
            </button>
            <button
              onClick={() => window.open('https://makersuite.google.com/app/apikey', '_blank')}
              className="text-blue-400 hover:text-blue-300 text-sm text-left"
            >
              Ottieni Gemini API Key
            </button>
            <button
              onClick={() => window.open('https://platform.deepseek.com', '_blank')}
              className="text-blue-400 hover:text-blue-300 text-sm text-left"
            >
              Ottieni DeepSeek API Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
