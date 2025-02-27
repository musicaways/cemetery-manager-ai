
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Database, WifiOff } from "lucide-react";

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
  offline?: boolean;
}

export const SuggestedQuestions = ({ onSelect, offline = false }: SuggestedQuestionsProps) => {
  const onlineSuggestions = [
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

  const offlineSuggestions = [
    {
      text: "Mostrami tutti i cimiteri",
      description: "Visualizza l'elenco dei cimiteri disponibili in modalità offline"
    },
    {
      text: "Mostrami il cimitero di Roma",
      description: "Visualizza i dettagli di un cimitero specifico (se disponibile offline)"
    },
    {
      text: "Cosa posso fare in modalità offline?",
      description: "Informazioni sulle funzionalità disponibili offline"
    }
  ];

  const suggestions = offline ? offlineSuggestions : onlineSuggestions;
  const icon = offline ? WifiOff : MessageSquare;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          className={`h-auto p-6 flex flex-col items-start space-y-2 bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 hover:border-blue-500/50 transition-all duration-300 ${
            offline ? 'border-amber-800/30 hover:border-amber-500/50' : ''
          }`}
          onClick={() => onSelect(suggestion.text)}
        >
          <div className="flex items-center space-x-3">
            {React.createElement(icon, { 
              className: `w-5 h-5 ${offline ? 'text-amber-400' : 'text-blue-400'}` 
            })}
            <span className="font-medium text-gray-100">{suggestion.text}</span>
          </div>
          <p className="text-sm text-gray-400 text-left">{suggestion.description}</p>
        </Button>
      ))}
    </div>
  );
};
