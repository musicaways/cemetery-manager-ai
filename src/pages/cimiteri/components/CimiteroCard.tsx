
import { ImagePlus, MapPin, Image, MapPinned, FileText, WifiOff } from "lucide-react";
import { Cimitero } from "../types";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface CimiteroCardProps {
  cimitero: Cimitero;
  onClick: () => void;
  isOffline?: boolean;
}

export const CimiteroCard = ({ cimitero, onClick, isOffline = false }: CimiteroCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const imageUrl = cimitero.FotoCopertina || cimitero.foto?.[0]?.Url;
  const cardRef = useRef<HTMLDivElement>(null);

  // Utilizziamo IntersectionObserver per il lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && imageRef.current) {
            // Quando il componente è visibile, carica l'immagine
            if (imageRef.current.dataset.src) {
              imageRef.current.src = imageRef.current.dataset.src;
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '200px' } // Precarica l'immagine quando è a 200px dalla viewport
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, []);

  // Gestione esplicita del click
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Click sulla card del cimitero:", cimitero.Descrizione);
    onClick();
  };

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      className={cn(
        "group relative bg-[#1A1F2C] backdrop-blur-xl rounded-xl overflow-hidden border border-white/10",
        "hover:border-[var(--primary-color)] transition-all duration-300 cursor-pointer hover:scale-[0.98]",
        isOffline && "border-amber-800/30"
      )}
    >
      <div className="aspect-video relative overflow-hidden">
        {imageUrl ? (
          <>
            {/* Skeleton di caricamento */}
            <div className={cn(
              "absolute inset-0 bg-gray-800/50 animate-pulse",
              imageLoaded && "hidden"
            )} />
            
            <img
              ref={imageRef}
              data-src={imageUrl}
              alt={cimitero.Descrizione || "Immagine cimitero"}
              className={cn(
                "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105",
                !imageLoaded && "opacity-0"
              )}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black/20">
            <ImagePlus className="w-8 h-8 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        {isOffline && (
          <div className="absolute top-2 right-2 bg-amber-600/90 text-white p-1 rounded-md text-xs flex items-center">
            <WifiOff className="h-3 w-3 mr-1" />
            <span>Offline</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-white line-clamp-1">
            {cimitero.Descrizione || "Nome non specificato"}
          </h3>
          <div className="flex items-center gap-2 text-gray-400">
            <div className="flex items-center">
              <Image className="w-4 h-4" />
              <span className="ml-1">{cimitero.foto?.length || 0}</span>
            </div>
            <div className="flex items-center">
              <MapPinned className="w-4 h-4" />
              <span className="ml-1">{cimitero.settori?.length || 0}</span>
            </div>
            <div className="flex items-center">
              <FileText className="w-4 h-4" />
              <span className="ml-1">{cimitero.documenti?.length || 0}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-400">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="line-clamp-1">{cimitero.Indirizzo || cimitero.Codice || "Indirizzo non specificato"}</span>
        </div>
      </div>
    </div>
  );
};
