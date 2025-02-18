
import { ScrollArea } from "@/components/ui/scroll-area";
import { CemeteryCard } from "./CemeteryCard";

interface ResultsListProps {
  data: any[];
  type: 'cemetery' | 'block' | 'deceased';
}

export const ResultsList = ({ data, type }: ResultsListProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        Nessun risultato trovato
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item) => {
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
