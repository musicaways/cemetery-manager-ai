
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

export const SuggestedQuestions = ({ onSelect }: SuggestedQuestionsProps) => {
  const suggestions = [
    {
      text: "Mostrami tutti i cimiteri",
      description: "Visualizza l'elenco completo dei cimiteri e le loro informazioni"
    },
    {
      text: "Trova i defunti nel Blocco Muri di Cinta",
      description: "Cerca informazioni specifiche sui defunti in questo blocco"
    },
    {
      text: "Quanti loculi sono disponibili?",
      description: "Verifica la disponibilità dei loculi nei vari settori"
    },
    {
      text: "Mostrami le statistiche generali",
      description: "Visualizza un riepilogo dei dati principali del sistema"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          className="h-auto p-6 flex flex-col items-start space-y-2 bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 hover:border-blue-500/50 transition-all duration-300"
          onClick={() => onSelect(suggestion.text)}
        >
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <span className="font-medium text-gray-100">{suggestion.text}</span>
          </div>
          <p className="text-sm text-gray-400 text-left">{suggestion.description}</p>
        </Button>
      ))}
    </div>
  );
};
