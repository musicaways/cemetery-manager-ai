
import { Button } from "@/components/ui/button";
import { Plus, Globe, Send } from "lucide-react";
import TextareaAutosize from 'react-textarea-autosize';
import { VoiceRecorder } from "./VoiceRecorder";
import { useTheme } from "@/lib/themeContext";

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
  const isChatGPT = theme === 'chatgpt';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSubmit(e);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full bg-gradient-to-t from 5% from-[#343541] via-[#343541] to-transparent pb-8 pt-6">
      <div className="flex-col">
        <div className="mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
          <div className="relative flex h-full flex-1 items-stretch md:flex-col">
            <div className="relative flex w-full flex-grow flex-col rounded-2xl border border-black/10 bg-[#40414F] shadow-[0_0_15px_rgba(0,0,0,0.1)]">
              <form onSubmit={handleSubmit} className="stretch flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
                <div className="flex flex-grow flex-col relative border-0 bg-transparent p-0">
                  <div className="relative flex items-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 h-9 w-9 p-1 text-gray-400 hover:text-gray-300"
                      onClick={onMediaUploadClick}
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute left-12 h-9 w-9 p-1 text-gray-400 hover:text-gray-300"
                      onClick={onWebSearchToggle}
                    >
                      <Globe className="h-5 w-5" />
                    </Button>
                    <TextareaAutosize
                      value={query}
                      onChange={(e) => onQueryChange(e.target.value)}
                      placeholder="Chatta con ChatGPT"
                      className="m-0 w-full resize-none border-0 bg-transparent py-3.5 pl-24 pr-20 text-white placeholder-gray-400/70 focus:ring-0 focus-visible:ring-0 dark:bg-transparent md:pl-24 md:pr-20"
                      disabled={isProcessing}
                      maxRows={4}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                    />
                    <div className="absolute right-2 flex items-center gap-2">
                      <VoiceRecorder onRecordingComplete={onVoiceRecord} />
                      {query.trim() && (
                        <Button
                          type="submit"
                          size="icon"
                          className="h-8 w-8 rounded-lg bg-[#19C37D] p-1 hover:bg-[#1A7F4E] disabled:opacity-50"
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
        {isChatGPT && (
          <div className="px-3 pt-2 text-center text-xs text-gray-500/50">
            ChatGPT può produrre informazioni inaccurate
          </div>
        )}
      </div>
    </div>
  );
};
