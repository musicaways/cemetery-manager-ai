
import { MapPin, MapPinned } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Cimitero } from "../../../types";

interface InfoTabProps {
  cimitero: Cimitero | null;
  editMode: boolean;
  editedData: Partial<Cimitero>;
  onInputChange: (field: string, value: string | number | null) => void;
}

export const InfoTab = ({ cimitero, editMode, editedData, onInputChange }: InfoTabProps) => {
  if (!cimitero) return null;

  return (
    <div className="space-y-4">
      {editMode ? (
        <>
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Nome cimitero</label>
            <Input
              value={editedData.Descrizione || ""}
              onChange={(e) => onInputChange("Descrizione", e.target.value)}
              className="bg-black/20 border-gray-700 focus:border-[var(--primary-color)]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Indirizzo</label>
            <Input
              value={editedData.Indirizzo || ""}
              onChange={(e) => onInputChange("Indirizzo", e.target.value)}
              className="bg-black/20 border-gray-700 focus:border-[var(--primary-color)]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Latitudine</label>
              <Input
                type="number"
                step="0.00000001"
                value={editedData.Latitudine || ""}
                onChange={(e) => onInputChange("Latitudine", parseFloat(e.target.value))}
                className="bg-black/20 border-gray-700 focus:border-[var(--primary-color)]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Longitudine</label>
              <Input
                type="number"
                step="0.00000001"
                value={editedData.Longitudine || ""}
                onChange={(e) => onInputChange("Longitudine", parseFloat(e.target.value))}
                className="bg-black/20 border-gray-700 focus:border-[var(--primary-color)]"
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold">{cimitero.Descrizione}</h2>
          <div className="space-y-2">
            <p className="text-gray-400 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              {cimitero.Indirizzo || "Indirizzo non specificato"}
            </p>
            {(cimitero.Latitudine && cimitero.Longitudine) && (
              <p className="text-gray-400 flex items-center">
                <MapPinned className="w-4 h-4 mr-2" />
                {cimitero.Latitudine}, {cimitero.Longitudine}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};
