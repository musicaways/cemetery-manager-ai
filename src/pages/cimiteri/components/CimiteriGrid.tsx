
import { Cimitero } from "../types";
import { CimiteroCard } from "./CimiteroCard";

interface CimiteriGridProps {
  cimiteri: Cimitero[];
  onSelectCimitero: (cimitero: Cimitero) => void;
  isOnline?: boolean;
}

export const CimiteriGrid = ({ cimiteri, onSelectCimitero, isOnline = true }: CimiteriGridProps) => {
  return (
    <>
      {!isOnline && cimiteri.length === 0 && (
        <div className="p-6 bg-amber-900/20 border border-amber-900/30 rounded-lg mb-6 text-center">
          <p className="text-amber-200">
            Non ci sono dati disponibili in modalità offline. 
            Riconnettiti a internet per caricare i dati dei cimiteri.
          </p>
        </div>
      )}
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
    </>
  );
};
