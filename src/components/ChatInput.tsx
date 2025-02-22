
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
    <footer className="fixed bottom-0 left-0 right-0 bg-[#333333] border-t border-white/5 backdrop-blur-xl p-4">
      <div className="max-w-3xl mx-auto space-y-3">
        {/* Action Buttons and Input Bar Container */}
        <div className="relative flex items-stretch gap-2">
          {/* Left-aligned buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 rounded-full border-2 transition-all duration-200 ${
                webSearchEnabled 
                  ? "text-[#9b87f5] border-[#9b87f5] bg-[#9b87f5]/10" 
                  : "text-gray-400 border-white/20 hover:text-[#9b87f5] hover:border-[#9b87f5] hover:bg-[#9b87f5]/10"
              }`}
              onClick={onWebSearchToggle}
              title={webSearchEnabled ? "Modalità Internet attiva" : "Modalità Database attiva"}
            >
              <Globe className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full border-2 border-white/20 text-gray-400 hover:text-[#9b87f5] hover:border-[#9b87f5] hover:bg-[#9b87f5]/10 transition-all duration-200"
              onClick={onMediaUploadClick}
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full border-2 border-white/20 text-gray-400 hover:text-[#9b87f5] hover:border-[#9b87f5] hover:bg-[#9b87f5]/10 transition-all duration-200"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black border-white/10 text-white">
                <DropdownMenuItem 
                  className="hover:bg-white/5 cursor-pointer"
                  onClick={() => handleCommandSelect("/test-model")}
                >
                  Test Modello AI
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Input Bar */}
          <div className="flex-1 relative mx-2">
            <input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder={webSearchEnabled 
                ? "Fammi qualsiasi domanda..." 
                : "Cerca informazioni su cimiteri, blocchi, loculi o defunti..."
              }
              className="w-full bg-[#333333] rounded-lg pl-4 pr-10 py-2.5 text-white placeholder-gray-400 focus:outline-none"
              style={{ textAlign: 'left' }}
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
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9b87f5] hover:text-[#7E69AB] h-8 w-8 p-0"
                disabled={isProcessing}
                variant="ghost"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Right-aligned voice recorder */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full border-2 border-white/20 text-gray-400 hover:text-[#9b87f5] hover:border-[#9b87f5] hover:bg-[#9b87f5]/10 transition-all duration-200 [&_svg]:h-4 [&_svg]:w-4 [&_.recording]:bg-[#9b87f5]/10 [&_.recording]:text-[#9b87f5] [&_.recording]:border-[#9b87f5]"
          >
            <VoiceRecorder 
              onRecordingComplete={onVoiceRecord}
            />
          </Button>
        </div>
      </div>
    </footer>
  );
};
