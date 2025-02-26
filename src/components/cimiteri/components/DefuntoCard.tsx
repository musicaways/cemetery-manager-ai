
import { format } from "date-fns";
import { it } from "date-fns/locale";
import type { Defunto } from "../hooks/useDefunti";

interface DefuntoCardProps {
  defunto: Defunto;
}

const formatDate = (date: string | null) => {
  if (!date) return "-";
  return format(new Date(date), "d MMMM yyyy", { locale: it });
};

export const DefuntoCard = ({ defunto }: DefuntoCardProps) => {
  return (
    <div className="p-4 bg-black/20 rounded-lg border border-gray-800/50 hover:border-[var(--primary-color)] transition-colors">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-white">
            {defunto.nominativo}
          </p>
          <span className="text-xs text-gray-500">
            {defunto.sesso === 'M' ? 'Maschio' : 'Femmina'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
          <div>
            <span className="text-gray-500">Data nascita:</span>
            <br />
            {formatDate(defunto.data_nascita)}
          </div>
          <div>
            <span className="text-gray-500">Data decesso:</span>
            <br />
            {formatDate(defunto.data_decesso)}
          </div>
        </div>
        {defunto.annotazioni && (
          <p className="text-xs text-gray-400">
            {defunto.annotazioni}
          </p>
        )}
        <div className="text-xs text-gray-500">
          <span>Età: {defunto.eta} anni</span>
        </div>
      </div>
    </div>
  );
};
