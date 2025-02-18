
import { useEffect, useState } from "react";
import { Settings, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type AIProvider = "groq" | "gemini" | "deepseek";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AISettings = ({ isOpen, onClose }: SettingsProps) => {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>("groq");

  const handleProviderChange = async (provider: AIProvider) => {
    try {
      const { data, error } = await supabase.functions.invoke('update-ai-provider', {
        body: { provider }
      });
      
      if (error) throw error;
      toast.success(`AI provider updated to ${provider}`);
      
    } catch (error) {
      toast.error("Failed to update AI provider");
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">AI Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Select AI Provider
            </label>
            <select
              value={selectedProvider}
              onChange={(e) => {
                setSelectedProvider(e.target.value as AIProvider);
                handleProviderChange(e.target.value as AIProvider);
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="groq">Groq</option>
              <option value="gemini">Gemini</option>
              <option value="deepseek">DeepSeek</option>
            </select>
          </div>
          
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => window.open('https://console.groq.com', '_blank')}
              className="text-blue-400 hover:text-blue-300 text-sm text-left"
            >
              Get Groq API Key
            </button>
            <button
              onClick={() => window.open('https://makersuite.google.com/app/apikey', '_blank')}
              className="text-blue-400 hover:text-blue-300 text-sm text-left"
            >
              Get Gemini API Key
            </button>
            <button
              onClick={() => window.open('https://platform.deepseek.com', '_blank')}
              className="text-blue-400 hover:text-blue-300 text-sm text-left"
            >
              Get DeepSeek API Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
