
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
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center gap-2 bg-[#40414F] rounded-xl px-4 py-2 shadow-lg border border-[#565869]/20">
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-gray-300"
                  >
                    <Command className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-[#202123] text-gray-200 border-[#565869]/20">
                  <DropdownMenuItem onClick={() => onQueryChange("/image")}>
                    Genera immagine
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onQueryChange("/code")}>
                    Scrivi codice
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onQueryChange("/analyze")}>
                    Analizza dati
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-gray-300"
                onClick={onMediaUploadClick}
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1">
              <TextareaAutosize
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Messaggio a ChatGPT..."
                className="w-full bg-transparent text-white placeholder:text-gray-400 resize-none p-2 outline-none max-h-[200px] overflow-y-auto"
                disabled={isProcessing}
                maxRows={8}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <VoiceRecorder onRecordingComplete={onVoiceRecord} />

              {query.trim() && (
                <Button
                  type="submit"
                  onClick={handleSubmit}
                  className="bg-[#19C37D] hover:bg-[#0EA36B] text-white rounded-lg px-4 py-2"
                  disabled={isProcessing}
                >
                  <Send className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </form>

        {isChatGPT && (
          <div className="mt-2 px-2 flex items-center justify-center text-xs text-[#8E8EA0]">
            ChatGPT può produrre informazioni inaccurate
          </div>
        )}
      </div>
    </div>
  );
};
