
import { Cimitero } from "../types";
import { CimiteroCard } from "./CimiteroCard";

interface CimiteriGridProps {
  cimiteri: Cimitero[];
  onSelectCimitero: (cimitero: Cimitero) => void;
  isOnline?: boolean;
}

export const CimiteriGrid = ({ cimiteri, onSelectCimitero, isOnline = true }: CimiteriGridProps) => {
  if (cimiteri.length === 0) {
    return (
      <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-lg text-center">
        <p className="text-gray-400">
          {isOnline 
            ? "Nessun cimitero trovato. Prova a modificare i criteri di ricerca."
            : "Non ci sono dati disponibili in modalità offline. Riconnettiti a internet per caricare i dati dei cimiteri."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cimiteri.map((cimitero) => (
        <CimiteroCard
          key={cimitero.Id}
          cimitero={cimitero}
          onClick={() => onSelectCimitero(cimitero)}
          isOffline={!isOnline}
        />
      ))}
    </div>
  );
};
