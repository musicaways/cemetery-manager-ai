
import { useState } from "react";
import { Cimitero } from "@/pages/cimiteri/types";
import { CimiteroCard } from "@/pages/cimiteri/components/CimiteroCard";
import { Separator } from "@/components/ui/separator";
import { CimiteroDetailsDialog } from "./CimiteroDetailsDialog";

interface CimiteriListProps {
  cimiteri: Cimitero[];
  isGrid?: boolean;
  onSelectCimitero?: (cimitero: Cimitero) => void;
}

export const CimiteriList = ({ cimiteri, isGrid = false, onSelectCimitero }: CimiteriListProps) => {
  const [selectedCimitero, setSelectedCimitero] = useState<Cimitero | null>(null);

  const handleCimiteroSelect = (cimitero: Cimitero) => {
    if (onSelectCimitero) {
      // Se è stata fornita una funzione di callback, usala
      onSelectCimitero(cimitero);
    } else {
      // Altrimenti utilizza lo stato locale
      setSelectedCimitero(cimitero);
    }
  };

  return (
    <>
      <div className={isGrid ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
        {cimiteri.map((cimitero) => (
          <div key={cimitero.Id}>
            <CimiteroCard 
              cimitero={cimitero} 
              onClick={() => handleCimiteroSelect(cimitero)} 
            />
            {!isGrid && <Separator className="my-4 bg-gray-800/50" />}
          </div>
        ))}
      </div>
      
      {/* Mostra il dialog solo se non c'è un handler esterno e c'è un cimitero selezionato */}
      {!onSelectCimitero && (
        <CimiteroDetailsDialog
          cimitero={selectedCimitero}
          isOpen={!!selectedCimitero}
          onClose={() => setSelectedCimitero(null)}
        />
      )}
    </>
  );
};
