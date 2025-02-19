import { Button } from "@/components/ui/button";
import { Plus, Command, Globe, Send, Image, Mic } from "lucide-react";
import { toast } from "sonner";
import TextareaAutosize from 'react-textarea-autosize';
import { VoiceRecorder } from "./VoiceRecorder";
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
    <div className="chatgpt-input-container">
      <div className="chatgpt-input-wrapper">
        <TextareaAutosize
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Messaggio a ChatGPT..."
          className="chatgpt-input chatgpt-scrollbar"
          disabled={isProcessing}
          maxRows={8}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        
        <div className="chatgpt-action-buttons">
          <Button
            variant="ghost"
            size="icon"
            className="chatgpt-actions-button"
            onClick={onMediaUploadClick}
          >
            <Plus className="w-4 h-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="chatgpt-actions-button"
              >
                <Command className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#202123] border-[#565869]/20">
              <DropdownMenuItem 
                className="text-gray-300 hover:bg-[#2A2B32] cursor-pointer"
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
            className="chatgpt-send-button"
            disabled={isProcessing}
          >
            <Send className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="max-w-3xl mx-auto mt-2 px-2 flex items-center justify-center text-xs text-gray-400">
        La chat può produrre informazioni inaccurate o contenuti offensivi
      </div>
    </div>
  );
};
