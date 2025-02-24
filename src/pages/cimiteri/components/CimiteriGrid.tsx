
import { Cimitero } from "../types";
import { CimiteroCard } from "./CimiteroCard";

interface CimiteriGridProps {
  cimiteri: Cimitero[];
  onSelectCimitero: (cimitero: Cimitero) => void;
}

export const CimiteriGrid = ({ cimiteri, onSelectCimitero }: CimiteriGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cimiteri.map((cimitero) => (
        <CimiteroCard
          key={cimitero.Id}
          cimitero={cimitero}
          onClick={() => onSelectCimitero(cimitero)}
        />
      ))}
    </div>
  );
};
