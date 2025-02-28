
import { Button } from "@/components/ui/button";
import { Globe, Paperclip, Settings, Mic, SendHorizonal, WifiOff } from "lucide-react";
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
  onFunctionsClick: () => void;
  isOnline?: boolean;
}

export const ChatInput = ({
  query,
  isProcessing,
  webSearchEnabled,
  onQueryChange,
  onSubmit,
  onMediaUploadClick,
  onVoiceRecord,
  onWebSearchToggle,
  onFunctionsClick,
  isOnline = true
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

  const handleMediaUploadClick = () => {
    if (!isOnline) {
      toast.error("L'upload di immagini non è disponibile in modalità offline", { duration: 2000 });
      return;
    }
    onMediaUploadClick();
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-[#333333] border-t border-white/5 backdrop-blur-xl p-4" style={{ bottom: 0, position: 'fixed', width: '100%' }}>
      <div className="max-w-5xl mx-auto space-y-3">
        {!isOnline && (
          <div className="bg-amber-800/40 text-amber-200 px-3 py-2 rounded-lg text-sm flex items-center mb-3">
            <WifiOff className="h-4 w-4 mr-2" />
            <span>Modalità offline - Funzionalità limitate disponibili</span>
          </div>
        )}
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
              onClick={handleSubmit}
              className="absolute right-0 top-0 h-8 w-8 p-0 rounded-full border-2 border-white/20 text-gray-400 hover:text-[#9b87f5] hover:border-[#9b87f5] hover:bg-[#9b87f5]/10 transition-all duration-200"
              disabled={isProcessing}
              variant="ghost"
            >
              <SendHorizonal className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between w-full">
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
              disabled={!isOnline}
            >
              <Globe className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`h-8 w-8 p-0 rounded-full border-2 border-white/20 text-gray-400 hover:text-[#9b87f5] hover:border-[#9b87f5] hover:bg-[#9b87f5]/10 transition-all duration-200 ${!isOnline ? 'opacity-50' : ''}`}
              onClick={handleMediaUploadClick}
              disabled={!isOnline}
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full border-2 border-white/20 text-gray-400 hover:text-[#9b87f5] hover:border-[#9b87f5] hover:bg-[#9b87f5]/10 transition-all duration-200"
              onClick={onFunctionsClick}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 rounded-full border-2 border-white/20 text-gray-400 hover:text-[#9b87f5] hover:border-[#9b87f5] hover:bg-[#9b87f5]/10 transition-all duration-200 [&_svg]:h-4 [&_svg]:w-4 [&_.recording]:bg-[#9b87f5]/10 [&_.recording]:text-[#9b87f5] [&_.recording]:border-[#9b87f5] ${!isOnline ? 'opacity-50' : ''}`}
            disabled={!isOnline}
          >
            <VoiceRecorder 
              onRecordingComplete={onVoiceRecord}
              disabled={!isOnline}
            />
          </Button>
        </div>
      </div>
    </footer>
  );
};
