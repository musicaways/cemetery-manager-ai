
import { MapPin, MapPinned, Locate } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Cimitero } from "../../../types";
import { toast } from "sonner";

interface InfoTabProps {
  cimitero: Cimitero | null;
  editMode: boolean;
  editedData: Partial<Cimitero>;
  onInputChange: (field: string, value: string | number | null) => void;
}

export const InfoTab = ({ cimitero, editMode, editedData, onInputChange }: InfoTabProps) => {
  if (!cimitero) return null;

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Il tuo browser non supporta la geolocalizzazione");
      return;
    }

    toast.info("Rilevamento posizione in corso...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Aggiorniamo entrambi i campi
        onInputChange("Latitudine", lat);
        onInputChange("Longitudine", lng);
        
        toast.success("Posizione rilevata con successo");
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Permesso di geolocalizzazione negato");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Posizione non disponibile");
            break;
          case error.TIMEOUT:
            toast.error("Timeout nel rilevamento della posizione");
            break;
          default:
            toast.error("Errore nel rilevamento della posizione");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="space-y-4 bg-black/20 p-4 rounded-lg border border-gray-800">
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">Coordinate GPS</label>
              <Button
                size="sm"
                variant="outline"
                onClick={handleGetLocation}
                className="h-8 text-xs border-gray-700 bg-black/20 hover:bg-black/40 text-gray-300 hover:text-white"
              >
                <Locate className="h-3.5 w-3.5 mr-1" />
                Rileva posizione
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  type="number"
                  step="0.00000001"
                  value={editedData.Latitudine || ""}
                  onChange={(e) => onInputChange("Latitudine", parseFloat(e.target.value))}
                  className="bg-black/20 border-gray-700 focus:border-[var(--primary-color)] text-white"
                  placeholder="Latitudine"
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="number"
                  step="0.00000001"
                  value={editedData.Longitudine || ""}
                  onChange={(e) => onInputChange("Longitudine", parseFloat(e.target.value))}
                  className="bg-black/20 border-gray-700 focus:border-[var(--primary-color)] text-white"
                  placeholder="Longitudine"
                />
              </div>
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
