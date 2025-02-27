
import { memo, useState, useEffect, useRef } from 'react';
import { ImagePlus, MapPin, Image, MapPinned, FileText, WifiOff } from "lucide-react";
import { Cimitero } from "../types";
import { cn } from "@/lib/utils";
import { performanceMonitor } from '@/lib/performanceMonitor';

interface CimiteroCardProps {
  cimitero: Cimitero;
  onClick: () => void;
  isOffline?: boolean;
  priority?: boolean;
}

export const CimiteroCardOptimized = memo(({ 
  cimitero, 
  onClick, 
  isOffline = false,
  priority = false
}: CimiteroCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageUrl = cimitero.FotoCopertina || cimitero.foto?.[0]?.Url;

  // Utilizziamo IntersectionObserver per lazy loading
  useEffect(() => {
    // Registra l'inizio del rendering
    const endMeasure = performanceMonitor.startMeasure(
      `cimitero-card-render-${cimitero.Id}`, 
      'render'
    );
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
            
            // Registra quando la card diventa visibile
            performanceMonitor.recordMetric(
              'render', 
              `cimitero-card-visible-${cimitero.Id}`, 
              performance.now(), 
              'ms'
            );
          }
        });
      },
      { rootMargin: '200px' } // Precarica quando è a 200px dalla viewport
    );
    
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    
    return () => {
      observer.disconnect();
      endMeasure();
    };
  }, [cimitero.Id]);

  // Ottimizzazione del caricamento delle immagini
  useEffect(() => {
    // Se la carta ha priorità o è visibile, prepara subito l'immagine
    if ((priority || isInView) && imageRef.current && imageUrl) {
      imageRef.current.src = imageUrl;
    }
  }, [imageUrl, isInView, priority]);

  // Gestione del caricamento dell'immagine
  const handleImageLoad = () => {
    setImageLoaded(true);
    performanceMonitor.recordMetric(
      'resource', 
      `cimitero-image-loaded-${cimitero.Id}`, 
      performance.now(), 
      'ms',
      { imageUrl }
    );
  };

  // Gestione dell'errore di caricamento dell'immagine
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true); // Per rimuovere lo skeleton
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={cn(
        "group relative bg-[#1A1F2C] backdrop-blur-xl rounded-xl overflow-hidden border border-white/10",
        "hover:border-[var(--primary-color)] transition-all duration-300 cursor-pointer hover:scale-[0.98]",
        isOffline && "border-amber-800/30"
      )}
    >
      <div className="aspect-video relative overflow-hidden">
        {/* Skeleton di caricamento */}
        <div className={cn(
          "absolute inset-0 bg-gray-800/50 animate-pulse",
          imageLoaded && "hidden"
        )} />
        
        {(isInView || priority) && imageUrl ? (
          <img
            ref={imageRef}
            alt={cimitero.Descrizione || "Immagine cimitero"}
            className={cn(
              "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105",
              !imageLoaded && "opacity-0"
            )}
            loading={priority ? "eager" : "lazy"}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
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
});

CimiteroCardOptimized.displayName = 'CimiteroCardOptimized';
