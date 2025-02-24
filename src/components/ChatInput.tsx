
import { Button } from "@/components/ui/button";
import { Globe, Paperclip, Settings, Mic, SendHorizonal } from "lucide-react";
import { toast } from "sonner";
import TextareaAutosize from "react-textarea-autosize";
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
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
      onSubmit(e);
    }
  };

  return (
    <footer className="fixed left-0 right-0 bg-[#333333] border-t border-white/5 backdrop-blur-xl p-4" style={{ 
      bottom: 'env(safe-area-inset-bottom)',
      position: 'fixed',
      width: '100%',
      zIndex: 9999
    }}>
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-3">
        <div className="relative flex items-start">
          <TextareaAutosize
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Chiedi qualcosa..."
            className="w-full bg-[#333333] text-white placeholder-gray-400 focus:outline-none resize-none pr-12 transition-all duration-200 ease-in-out"
            style={{ textAlign: 'left' }}
            disabled={isProcessing}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            minRows={1}
            maxRows={5}
          />
          {query.trim() && (
            <Button 
              type="submit" 
              size="sm"
              onClick={(e) => handleSubmit(e)}
              className="absolute right-0 top-0 h-8 w-8 p-0 rounded-full border-2 border-white/20 text-gray-400 hover:text-[#9b87f5] hover:border-[#9b87f5] hover:bg-[#9b87f5]/10 transition-all duration-200"
              disabled={isProcessing}
              variant="ghost"
            >
              <SendHorizonal className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={onMediaUploadClick}
              className="h-8 w-8 p-0 rounded-full border-2 border-white/20 text-gray-400 hover:text-[#9b87f5] hover:border-[#9b87f5] hover:bg-[#9b87f5]/10 transition-all duration-200"
              variant="ghost"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <VoiceRecorder onRecordingComplete={onVoiceRecord} />

            <Button
              type="button"
              size="sm"
              onClick={onWebSearchToggle}
              className={`h-8 w-8 p-0 rounded-full border-2 transition-all duration-200 ${
                webSearchEnabled 
                  ? 'border-[#9b87f5] text-[#9b87f5] bg-[#9b87f5]/10' 
                  : 'border-white/20 text-gray-400 hover:text-[#9b87f5] hover:border-[#9b87f5] hover:bg-[#9b87f5]/10'
              }`}
              variant="ghost"
            >
              <Globe className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </footer>
  );
};
