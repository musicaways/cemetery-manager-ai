
import { MapPin } from "lucide-react";
import { CimiteroMappe } from "../../../types";
import { LocationMap } from "../components/LocationMap";

interface MapsTabProps {
  mappe: CimiteroMappe[];
  onDelete?: () => void;
  canEdit?: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

export const MapsTab = ({ latitude, longitude }: MapsTabProps) => {
  if (!latitude || !longitude) {
    return (
      <div className="text-center py-8 text-gray-400">
        <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-600" />
        <p>Nessuna coordinata GPS disponibile per questo cimitero.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <LocationMap latitude={latitude} longitude={longitude} />
    </div>
  );
};
