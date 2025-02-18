
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

export const SuggestedQuestions = ({ onSelect }: SuggestedQuestionsProps) => {
  const suggestions = [
    {
      text: "Mostrami tutti i cimiteri",
      description: "Visualizza l'elenco completo dei cimiteri"
    },
    {
      text: "Trova i defunti nel Blocco Muri di Cinta",
      description: "Cerca informazioni specifiche sui defunti in questo blocco"
    },
    {
      text: "Quanti loculi sono disponibili?",
      description: "Verifica la disponibilità dei loculi"
    },
    {
      text: "Mostrami le statistiche generali",
      description: "Visualizza un riepilogo dei dati principali"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          className="h-auto p-4 flex flex-col items-start space-y-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          onClick={() => onSelect(suggestion.text)}
        >
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span className="font-medium">{suggestion.text}</span>
          </div>
          <p className="text-sm text-gray-500 text-left">{suggestion.description}</p>
        </Button>
      ))}
    </div>
  );
};
