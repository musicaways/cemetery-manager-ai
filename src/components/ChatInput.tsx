
import { Button } from "@/components/ui/button";
import { Globe, Paperclip, Settings, Mic, Send } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  webSearchEnabled,
  onQueryChange,
  onSubmit,
  onMediaUploadClick,
  onVoiceRecord,
  onWebSearchToggle
}: ChatInputProps) => {
  const handleCommandSelect = (command: string) => {
    onQueryChange(command);
    const submitEvent = new Event('submit', {
      bubbles: true,
      cancelable: true,
    }) as unknown as React.FormEvent;
    onSubmit(submitEvent);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSubmit(e);
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-[#1A1F2C] border-t border-[#2A2F3C]/40 backdrop-blur-xl p-4">
      <div className="max-w-3xl mx-auto space-y-3">
        {/* Input Bar */}
        <div className="relative">
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={webSearchEnabled 
              ? "Fammi qualsiasi domanda..." 
              : "Cerca informazioni su cimiteri, blocchi, loculi o defunti..."
            }
            className="w-full bg-[#2A2F3C]/50 border border-[#3A3F4C]/50 rounded-lg px-4 py-2.5 text-gray-100 placeholder-[#8E9196] focus:outline-none focus:ring-2 focus:ring-[#9b87f5]/50"
            disabled={isProcessing}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          {query.trim() && (
            <Button 
              type="submit" 
              size="sm"
              onClick={handleSubmit}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#9b87f5] hover:bg-[#7E69AB] text-white h-8 w-8 p-0"
              disabled={isProcessing}
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 transition-colors ${
              webSearchEnabled 
                ? "text-[#9b87f5] bg-[#9b87f5]/10" 
                : "text-[#8E9196] hover:text-[#9b87f5] hover:bg-[#9b87f5]/10"
            }`}
            onClick={onWebSearchToggle}
            title={webSearchEnabled ? "Modalità Internet attiva" : "Modalità Database attiva"}
          >
            <Globe className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-[#8E9196] hover:text-[#9b87f5] hover:bg-[#9b87f5]/10 h-8 w-8 p-0"
            onClick={onMediaUploadClick}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#8E9196] hover:text-[#9b87f5] hover:bg-[#9b87f5]/10 h-8 w-8 p-0"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#2A2F3C] border-[#3A3F4C] text-gray-100">
              <DropdownMenuItem 
                className="hover:bg-[#3A3F4C] cursor-pointer"
                onClick={() => handleCommandSelect("/test-model")}
              >
                Test Modello AI
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <VoiceRecorder 
            onRecordingComplete={onVoiceRecord}
          />
        </div>
      </div>
    </footer>
  );
};
