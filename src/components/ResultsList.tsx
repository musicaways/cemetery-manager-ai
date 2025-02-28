
import { ScrollArea } from "@/components/ui/scroll-area";
import { CemeteryCard } from "./CemeteryCard";

interface ResultsListProps {
  results: any[];
  type?: 'cemetery' | 'block' | 'deceased';
}

export const ResultsList = ({ results, type = 'cemetery' }: ResultsListProps) => {
  if (!results || results.length === 0) {
    return (
      <div className="text-center p-8 text-gray-400 bg-gray-800/50 rounded-lg border border-gray-700">
        <p className="text-lg">Nessun risultato trovato</p>
        <p className="text-sm mt-2">Prova a modificare i termini della ricerca</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((item) => {
          switch (type) {
            case 'cemetery':
              return <CemeteryCard key={item.Id} cemetery={item} />;
            // Aggiungi altri casi per blocchi e defunti
            default:
              return null;
          }
        })}
      </div>
    </ScrollArea>
  );
};
