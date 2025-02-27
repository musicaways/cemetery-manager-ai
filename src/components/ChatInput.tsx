
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
import { cn } from "@/lib/utils";

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
    <footer className="fixed bottom-0 left-0 right-0 bg-[#1A1F2C]/95 border-t border-white/5 backdrop-blur-xl p-4 z-10" style={{ bottom: 0, position: 'fixed', width: '100%' }}>
      <div className="mx-auto space-y-3 max-w-4xl">
        {!isOnline && (
          <div className="bg-amber-800/40 text-amber-200 px-3 py-2 rounded-lg text-sm flex items-center mb-3">
            <WifiOff className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>Modalità offline - Funzionalità limitate disponibili</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex glass-panel rounded-xl overflow-hidden transition-all duration-200 border-2 focus-within:border-[var(--primary-color)] hover:border-white/30 border-white/10">
            <TextareaAutosize
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Chiedi qualcosa..."
              className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none resize-none p-3 pr-12 transition-all duration-200 ease-in-out"
              style={{ textAlign: 'left' }}
              disabled={isProcessing}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              minRows={1}
              maxRows={4}
            />
            
            {query.trim() && (
              <Button 
                type="submit" 
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full bg-primary text-white hover:bg-primary/90 transition-all duration-200"
                disabled={isProcessing}
              >
                <SendHorizonal className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 rounded-full border transition-all duration-200",
                  webSearchEnabled 
                    ? "text-primary border-primary bg-primary/10" 
                    : "text-gray-400 border-white/20 hover:text-primary hover:border-primary hover:bg-primary/10",
                  !isOnline && "opacity-50 cursor-not-allowed"
                )}
                onClick={onWebSearchToggle}
                title={webSearchEnabled ? "Modalità Internet attiva" : "Modalità Database attiva"}
                disabled={!isOnline}
              >
                <Globe className="h-4 w-4" />
                <span className="sr-only">{webSearchEnabled ? "Internet attivo" : "Database locale"}</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 rounded-full border border-white/20 text-gray-400 hover:text-primary hover:border-primary hover:bg-primary/10 transition-all duration-200",
                  !isOnline && "opacity-50 cursor-not-allowed"
                )}
                onClick={handleMediaUploadClick}
                disabled={!isOnline}
              >
                <Paperclip className="h-4 w-4" />
                <span className="sr-only">Allega file</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full border border-white/20 text-gray-400 hover:text-primary hover:border-primary hover:bg-primary/10 transition-all duration-200"
                onClick={onFunctionsClick}
              >
                <Settings className="h-4 w-4" />
                <span className="sr-only">Funzioni</span>
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0 rounded-full border border-white/20 text-gray-400 hover:text-primary hover:border-primary hover:bg-primary/10 transition-all duration-200",
                "[&_svg]:h-4 [&_svg]:w-4 [&_.recording]:bg-primary/10 [&_.recording]:text-primary [&_.recording]:border-primary",
                !isOnline && "opacity-50 cursor-not-allowed"
              )}
              disabled={!isOnline}
            >
              <VoiceRecorder 
                onRecordingComplete={onVoiceRecord}
                disabled={!isOnline}
              />
              <span className="sr-only">Registra messaggio vocale</span>
            </Button>
          </div>
        </form>

        <div className="md:hidden h-12">
          {/* Spazio extra per evitare che il footer mobile copra il contenuto */}
        </div>
      </div>
    </footer>
  );
};
