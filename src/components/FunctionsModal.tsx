
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bot, Search, FileText, Code } from "lucide-react";

interface FunctionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFunctionSelect: (functionType: string) => void;
}

export const FunctionsModal = ({ isOpen, onClose, onFunctionSelect }: FunctionsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A1F2C] border-gray-800 text-gray-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Seleziona funzione</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="flex flex-col items-center p-6 h-auto space-y-2 bg-gray-800/50 border-gray-700 hover:bg-gray-700/50"
            onClick={() => onFunctionSelect('search')}
          >
            <Search className="h-8 w-8 text-blue-400" />
            <span>Ricerca web</span>
            <span className="text-xs text-gray-400">Cerca informazioni online</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center p-6 h-auto space-y-2 bg-gray-800/50 border-gray-700 hover:bg-gray-700/50"
            onClick={() => onFunctionSelect('analyze')}
          >
            <Bot className="h-8 w-8 text-purple-400" />
            <span>Analisi AI</span>
            <span className="text-xs text-gray-400">Analizza contenuti con l'AI</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center p-6 h-auto space-y-2 bg-gray-800/50 border-gray-700 hover:bg-gray-700/50"
            onClick={() => onFunctionSelect('file')}
          >
            <FileText className="h-8 w-8 text-green-400" />
            <span>File</span>
            <span className="text-xs text-gray-400">Gestisci i tuoi file</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center p-6 h-auto space-y-2 bg-gray-800/50 border-gray-700 hover:bg-gray-700/50"
            onClick={() => onFunctionSelect('code')}
          >
            <Code className="h-8 w-8 text-yellow-400" />
            <span>Codice</span>
            <span className="text-xs text-gray-400">Genera e analizza codice</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
