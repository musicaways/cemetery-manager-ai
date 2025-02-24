
import { MapPinned } from "lucide-react";
import { Settore } from "../../../types";

interface SectorsTabProps {
  settori: Settore[];
}

export const SectorsTab = ({ settori }: SectorsTabProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center text-white">
        <MapPinned className="w-5 h-5 mr-2 text-[var(--primary-color)]" />
        Settori
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settori?.map((settore) => (
          <div
            key={settore.Id}
            className="p-4 bg-black/20 rounded-lg border border-gray-800 hover:border-[var(--primary-color)] transition-colors"
          >
            <h4 className="font-medium mb-1 text-white">{settore.Descrizione}</h4>
            <p className="text-sm text-gray-400">{settore.Codice}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
