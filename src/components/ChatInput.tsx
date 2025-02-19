
import { Button } from "@/components/ui/button";
import { Plus, Globe, Send } from "lucide-react";
import TextareaAutosize from 'react-textarea-autosize';
import { VoiceRecorder } from "./VoiceRecorder";
import { useTheme } from "@/lib/themeContext";
import { useState } from "react";

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
  webSearchEnabled,
  onQueryChange,
  onSubmit,
  onMediaUploadClick,
  onVoiceRecord,
  onWebSearchToggle
}: ChatInputProps) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSubmit(e);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#343541] via-[#343541] to-transparent pb-8 pt-6">
      <div className="relative mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
        <div className="relative flex h-full flex-1 items-stretch md:flex-col">
          <div className={`relative flex w-full flex-grow flex-col rounded-xl border ${
            isFocused ? 'border-[#6A6B7B]' : 'border-[#565869]'
          } bg-[#40414F] shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-colors duration-200`}>
            <form onSubmit={handleSubmit} className="stretch flex flex-row gap-3 px-4 py-3">
              <div className="flex flex-grow flex-col relative">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0 text-[#A8A8B3] hover:text-[#ECECF1] hover:bg-[#565869] transition-all duration-200"
                    onClick={onMediaUploadClick}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                  <div className="flex items-center gap-1 rounded-xl bg-[#202123]/40 px-2 py-1 hover:bg-[#202123]/60 transition-colors duration-200 cursor-pointer" onClick={onWebSearchToggle}>
                    <Globe className="h-5 w-5 text-[#A8A8B3]" />
                    <span className="text-sm text-[#A8A8B3]">Cerca</span>
                  </div>
                  <TextareaAutosize
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Messaggio a ChatGPT..."
                    className="m-0 flex-1 resize-none border-0 bg-transparent text-[#ECECF1] placeholder-[#8E8EA0] outline-none focus:ring-0 focus-visible:ring-0 md:py-0"
                    disabled={isProcessing}
                    maxRows={4}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <VoiceRecorder onRecordingComplete={onVoiceRecord} />
                    {query.trim() && (
                      <Button
                        type="submit"
                        size="icon"
                        className={`h-8 w-8 rounded-lg bg-[#19C37D] p-1 transition-all duration-200 
                          ${query.trim() ? 'opacity-100 hover:bg-[#1A7F4E] hover:rotate-[30deg]' : 'opacity-50'}
                          disabled:opacity-50`}
                        disabled={isProcessing}
                      >
                        <Send className="h-4 w-4 text-white" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="px-3 pt-2 text-center text-xs text-[#8E8EA0]">
        ChatGPT può commettere errori. Considera di verificare le informazioni importanti.
      </div>
    </div>
  );
};
