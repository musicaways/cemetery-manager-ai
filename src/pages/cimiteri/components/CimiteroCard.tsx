
import { ImagePlus, MapPin, Image, MapPinned, FileText } from "lucide-react";
import { Cimitero } from "../types";

interface CimiteroCardProps {
  cimitero: Cimitero;
  onClick: () => void;
}

export const CimiteroCard = ({ cimitero, onClick }: CimiteroCardProps) => {
  return (
    <div
      onClick={onClick}
      className="group relative bg-[#1A1F2C] backdrop-blur-xl rounded-xl overflow-hidden border border-white/10 hover:border-[var(--primary-color)] transition-all duration-300 cursor-pointer hover:scale-[0.98]"
    >
      <div className="aspect-video relative overflow-hidden">
        {(cimitero.FotoCopertina || cimitero.foto?.[0]?.Url) ? (
          <img
            src={cimitero.FotoCopertina || cimitero.foto[0].Url}
            alt={cimitero.Descrizione || "Immagine cimitero"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black/20">
            <ImagePlus className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      </div>

      <div className="p-4">
        <h3 className="text-xl font-semibold text-white mb-2 line-clamp-1">
          {cimitero.Descrizione || "Nome non specificato"}
        </h3>
        <div className="flex items-center text-sm text-gray-400">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="line-clamp-1">{cimitero.Indirizzo || cimitero.Codice || "Indirizzo non specificato"}</span>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center text-gray-400">
            <Image className="w-4 h-4 mr-1" />
            <span>{cimitero.foto?.length || 0}</span>
          </div>
          <div className="flex items-center text-gray-400">
            <MapPinned className="w-4 h-4 mr-1" />
            <span>{cimitero.settori?.length || 0}</span>
          </div>
          <div className="flex items-center text-gray-400">
            <FileText className="w-4 h-4 mr-1" />
            <span>{cimitero.documenti?.length || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
