
import { Button } from "@/components/ui/button";

interface SuggestedQuestionsProps {
  questions?: string[];
  onSelect: (question: string) => void;
  offline?: boolean;
}

export const SuggestedQuestions = ({ questions, onSelect, offline = false }: SuggestedQuestionsProps) => {
  const offlineQuestions = [
    "Quali funzionalità posso usare offline?",
    "Mostra cimiteri disponibili",
    "Come cercare un defunto in modalità offline",
    "Quando sarà disponibile la sincronizzazione dei dati offline?"
  ];

  const onlineQuestions = [
    "Mostra l'elenco dei cimiteri",
    "Come posso cercare un defunto?",
    "Quali funzionalità di ricerca sono disponibili?",
    "Mostra informazioni sul cimitero di Milano"
  ];

  const displayQuestions = questions && questions.length > 0 ? questions : (offline ? offlineQuestions : onlineQuestions);

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {displayQuestions.map((question, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          className={`rounded-full text-xs ${
            offline 
              ? "bg-amber-900/20 hover:bg-amber-900/30 border-amber-700/30 text-amber-200" 
              : "bg-[#2A2A3C] hover:bg-[#3A3A4C] border-[#4A4A5C]"
          }`}
          onClick={() => onSelect(question)}
        >
          {question}
        </Button>
      ))}
    </div>
  );
};
