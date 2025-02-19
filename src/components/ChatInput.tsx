
import { Button } from "@/components/ui/button";
import { Plus, Command, Globe, Send, Image, Mic } from "lucide-react";
import { toast } from "sonner";
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
    <div className={isChatGPT ? 'input-container' : 'fixed bottom-0 left-0 right-0 px-4 py-4 bg-gradient-to-t from-background via-background to-transparent'}>
      <div className={isChatGPT ? 'input-wrapper' : 'relative max-w-3xl mx-auto'}>
        <TextareaAutosize
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={isChatGPT ? "Messaggio a ChatGPT..." : "Scrivi un messaggio..."}
          className={isChatGPT ? 'input custom-scrollbar' : 'w-full bg-secondary text-foreground placeholder:text-muted-foreground resize-none p-4 pr-32 rounded-xl outline-none max-h-[200px] overflow-y-auto custom-scrollbar'}
          disabled={isProcessing}
          maxRows={8}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        
        <div className={isChatGPT ? 'action-buttons' : 'absolute left-2 bottom-2 flex items-center gap-1'}>
          <Button
            variant="ghost"
            size="icon"
            className={isChatGPT ? 'action-button' : 'text-muted-foreground hover:text-foreground'}
            onClick={onMediaUploadClick}
          >
            <Plus className="w-4 h-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={isChatGPT ? 'action-button' : 'text-muted-foreground hover:text-foreground'}
              >
                <Command className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={isChatGPT ? 'bg-[#202123] border-[#565869]/20' : ''}>
              <DropdownMenuItem 
                className={isChatGPT ? 'text-[#ECECF1] hover:bg-[#2A2B32] cursor-pointer' : ''}
                onClick={() => handleCommandSelect("/test-model")}
              >
                Test Modello AI
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {query.trim() && (
          <Button
            type="submit"
            onClick={handleSubmit}
            className={isChatGPT ? 'send-button' : 'absolute right-2 bottom-2 bg-primary hover:bg-primary-hover text-white'}
            disabled={isProcessing}
          >
            <Send className="w-4 h-4" />
          </Button>
        )}
      </div>

      {isChatGPT && (
        <div className="max-w-3xl mx-auto mt-2 px-2 flex items-center justify-center text-xs text-[#8E8EA0]">
          La chat può produrre informazioni inaccurate o contenuti offensivi
        </div>
      )}
    </div>
  );
};
