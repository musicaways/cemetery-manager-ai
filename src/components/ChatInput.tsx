
import { Button } from "@/components/ui/button";
import { Plus, Command, Send } from "lucide-react";
import TextareaAutosize from 'react-textarea-autosize';
import { VoiceRecorder } from "./VoiceRecorder";
import { useTheme } from "@/lib/themeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    <div className="fixed bottom-0 left-0 right-0 w-full">
      <div className="relative pb-3 pt-2 md:pt-0 w-full">
        <div className="stretch mx-2 flex flex-row gap-3 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
          <div className="relative flex h-full flex-1 flex-col">
            <div className="relative flex w-full flex-grow flex-col rounded-xl border border-black/10 bg-[#40414F] shadow-[0_0_15px_rgba(0,0,0,0.1)] sm:rounded-2xl">
              <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="relative flex flex-grow flex-col rounded-md bg-transparent px-4 py-2.5">
                  <TextareaAutosize
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    placeholder="Messaggio a ChatGPT..."
                    className="m-0 h-6 max-h-32 w-full resize-none border-0 bg-transparent p-0 pl-0 pr-10 text-white placeholder:text-gray-400 focus:outline-none focus:ring-0 focus-visible:ring-0 sm:text-sm"
                    disabled={isProcessing}
                    maxRows={4}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                  <div className="absolute bottom-1.5 right-2 flex items-center gap-2">
                    <VoiceRecorder onRecordingComplete={onVoiceRecord} />
                    {query.trim() && (
                      <Button
                        type="submit"
                        size="icon"
                        className="group h-7 w-7 rounded-lg border border-transparent bg-[#19C37D] transition-colors hover:bg-[#1A7F4E] disabled:opacity-50"
                        disabled={isProcessing}
                      >
                        <Send className="h-4 w-4 text-white" />
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        {isChatGPT && (
          <div className="mt-2 text-center text-xs text-gray-500">
            ChatGPT può produrre informazioni inaccurate
          </div>
        )}
      </div>
    </div>
  );
};
