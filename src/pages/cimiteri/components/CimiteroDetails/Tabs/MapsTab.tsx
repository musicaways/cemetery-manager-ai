
import { MapPin } from "lucide-react";
import { CimiteroMappe } from "../../../types";

interface MapsTabProps {
  mappe: CimiteroMappe[];
}

export const MapsTab = ({ mappe }: MapsTabProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center text-white">
        <MapPin className="w-5 h-5 mr-2 text-[var(--primary-color)]" />
        Mappe
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mappe?.map((mappa) => (
          <a
            key={mappa.Id}
            href={mappa.Url}
            target="_blank"
            rel="noopener noreferrer"
            className="block aspect-[4/3] relative group rounded-lg overflow-hidden border border-gray-800 hover:border-[var(--primary-color)] transition-colors"
          >
            <img
              src={mappa.Url}
              alt={mappa.Descrizione || "Mappa cimitero"}
              className="w-full h-full object-cover"
            />
            {mappa.Descrizione && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                <p className="text-white text-sm text-center">{mappa.Descrizione}</p>
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
};
