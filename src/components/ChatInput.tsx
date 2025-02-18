
import { Button } from "@/components/ui/button";
import { Plus, Command } from "lucide-react";
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
  onQueryChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onMediaUploadClick: () => void;
  onVoiceRecord: (text: string) => void;
}

export const ChatInput = ({
  query,
  isProcessing,
  onQueryChange,
  onSubmit,
  onMediaUploadClick,
  onVoiceRecord
}: ChatInputProps) => {

  const handleCommandSelect = (command: string) => {
    onQueryChange(command);
    // Simuliamo un submit del form
    const form = document.createElement('form');
    const submitEvent = new Event('submit', {
      bubbles: true,
      cancelable: true,
    });
    
    // Preveniamo il submit reale del form
    submitEvent.preventDefault = () => {};
    
    // Innescheremo l'evento
    onSubmit(submitEvent as unknown as React.FormEvent);
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-[#1A1F2C] border-t border-[#2A2F3C]/40 backdrop-blur-xl p-3">
      <div className="max-w-3xl mx-auto flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-[#8E9196] hover:text-[#9b87f5] h-8 w-8"
          onClick={onMediaUploadClick}
        >
          <Plus className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#8E9196] hover:text-[#9b87f5] h-8 w-8"
            >
              <Command className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#2A2F3C] border-[#3A3F4C] text-gray-100">
            <DropdownMenuItem 
              className="hover:bg-[#3A3F4C] cursor-pointer"
              onClick={() => handleCommandSelect("/test-model")}
            >
              Test Modello AI
            </DropdownMenuItem>
            {/* Qui possiamo aggiungere altri comandi in futuro */}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="flex-1">
          <form onSubmit={onSubmit}>
            <div className="flex items-center space-x-2 p-2 bg-[#2A2F3C]/50 rounded-lg border border-[#3A3F4C]/50">
              <TextareaAutosize
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Chiedimi quello che vuoi sapere... (usa /test-model per verificare il modello)"
                className="flex-1 bg-transparent outline-none placeholder-[#8E9196] text-gray-100 resize-none min-h-[36px] max-h-[120px] py-1"
                disabled={isProcessing}
                maxRows={4}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSubmit(e);
                  }
                }}
              />
              {query.trim() && (
                <Button type="submit" size="sm" className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white h-8">
                  Invia
                </Button>
              )}
            </div>
          </form>
        </div>

        <VoiceRecorder onRecordingComplete={onVoiceRecord} />
      </div>
    </footer>
  );
};
