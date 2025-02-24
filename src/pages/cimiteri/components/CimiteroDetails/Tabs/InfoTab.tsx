
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
    <div className="space-y-4 bg-black/20 p-4 rounded-lg border border-gray-800">
      <h3 className="text-lg font-semibold text-white mb-4">Informazioni principali</h3>
      {editMode ? (
        <>
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Nome cimitero</label>
            <Input
              value={editedData.Descrizione || ""}
              onChange={(e) => onInputChange("Descrizione", e.target.value)}
              className="bg-black/20 border-gray-700 focus:border-[var(--primary-color)] text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Indirizzo</label>
            <Input
              value={editedData.Indirizzo || ""}
              onChange={(e) => onInputChange("Indirizzo", e.target.value)}
              className="bg-black/20 border-gray-700 focus:border-[var(--primary-color)] text-white"
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
                className="bg-black/20 border-gray-700 focus:border-[var(--primary-color)] text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Longitudine</label>
              <Input
                type="number"
                step="0.00000001"
                value={editedData.Longitudine || ""}
                onChange={(e) => onInputChange("Longitudine", parseFloat(e.target.value))}
                className="bg-black/20 border-gray-700 focus:border-[var(--primary-color)] text-white"
              />
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <p className="text-gray-200 flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-[var(--primary-color)]" />
            {cimitero.Indirizzo || "Indirizzo non specificato"}
          </p>
          {(cimitero.Latitudine && cimitero.Longitudine) && (
            <p className="text-gray-200 flex items-center">
              <MapPinned className="w-4 h-4 mr-2 text-[var(--primary-color)]" />
              {cimitero.Latitudine}, {cimitero.Longitudine}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
