
import { Send } from "lucide-react";
import { useState } from "react";
import { VoiceRecorder } from "./VoiceRecorder";

interface ChatInputProps {
  query: string;
  isProcessing: boolean;
  webSearchEnabled: boolean;
  onQueryChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onMediaUploadClick: () => void;
  onVoiceRecord: (text: string) => void;
  onWebSearchToggle: () => void;
}

export const ChatInput = ({
  query,
  isProcessing,
  onQueryChange,
  onSubmit,
  onVoiceRecord
}: ChatInputProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSubmit(e);
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-2xl">
      <div className="bg-[#40414F] border border-[#565869] rounded-xl px-4 py-3 flex items-center shadow-md">
        {/* Icona Microfono */}
        <VoiceRecorder 
          onRecordingComplete={onVoiceRecord}
          className="p-2 rounded-md hover:bg-[#565869] transition"
        />

        {/* Campo di Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Messaggio a ChatGPT..."
          className="flex-1 bg-transparent text-[#ECECF1] placeholder-[#A8A8B3] outline-none px-3"
          disabled={isProcessing}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />

        {/* Icona Invio */}
        {query.trim() && (
          <button
            disabled={!query.trim() || isProcessing}
            className={`p-2 rounded-md transition-all duration-200 ${
              query.trim() && !isProcessing ? "opacity-100 hover:rotate-12" : "opacity-50"
            }`}
            onClick={(e) => handleSubmit(e)}
          >
            <Send className="w-5 h-5 text-[#A8A8B3] hover:text-white" />
          </button>
        )}
      </div>
      <div className="px-3 pt-2 text-center text-xs text-[#8E8EA0]">
        ChatGPT può commettere errori. Considera di verificare le informazioni importanti.
      </div>
    </div>
  );
};
