
import React from "react";
import { Cimitero } from "@/pages/cimiteri/types";
import { Button } from "@/components/ui/button";
import { MapPin, Info, ChevronRight } from "lucide-react";

interface CimiteriListProps {
  cimiteri: Cimitero[];
  isGrid?: boolean;
  onSelectCimitero?: (cimitero: Cimitero) => void;
}

export const CimiteriList: React.FC<CimiteriListProps> = ({ 
  cimiteri, 
  isGrid = false,
  onSelectCimitero 
}) => {
  if (!cimiteri || cimiteri.length === 0) {
    return (
      <div className="py-3 px-4 bg-gray-800/50 rounded-lg text-gray-400 text-center">
        Nessun cimitero trovato.
      </div>
    );
  }

  const handleSelect = (cimitero: Cimitero) => {
    if (onSelectCimitero) {
      onSelectCimitero(cimitero);
    }
  };

  if (isGrid) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cimiteri.map((cimitero) => (
          <div 
            key={cimitero.Id} 
            className="bg-gray-800/50 border border-gray-700/50 rounded-lg overflow-hidden hover:bg-gray-700/30 transition-colors cursor-pointer"
            onClick={() => handleSelect(cimitero)}
          >
            <div className="p-3 flex items-start space-x-3">
              <div className="flex-shrink-0 h-16 w-16 bg-gray-700 rounded-md overflow-hidden">
                {cimitero.FotoCopertina ? (
                  <img 
                    src={cimitero.FotoCopertina} 
                    alt={cimitero.Descrizione} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-700 text-gray-500">
                    <MapPin size={24} />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">{cimitero.Descrizione}</h4>
                
                {cimitero.Indirizzo && (
                  <p className="text-gray-400 text-sm mt-1 flex items-center">
                    <MapPin size={14} className="mr-1 flex-shrink-0" />
                    <span className="truncate">{cimitero.Indirizzo}</span>
                  </p>
                )}
                
                <div className="mt-2 flex">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs border-gray-600 bg-gray-700/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(cimitero);
                    }}
                  >
                    <Info size={14} className="mr-1" />
                    Dettagli
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Visualizzazione a lista
  return (
    <div className="space-y-3">
      {cimiteri.map((cimitero) => (
        <div 
          key={cimitero.Id}
          className="bg-gray-800/50 border border-gray-700/50 rounded-lg overflow-hidden hover:bg-gray-700/30 transition-colors cursor-pointer"
          onClick={() => handleSelect(cimitero)}
        >
          <div className="p-3 flex items-center">
            <div className="flex-shrink-0 h-12 w-12 mr-3 bg-gray-700 rounded-md overflow-hidden">
              {cimitero.FotoCopertina ? (
                <img 
                  src={cimitero.FotoCopertina} 
                  alt={cimitero.Descrizione} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-700 text-gray-500">
                  <MapPin size={20} />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium">{cimitero.Descrizione}</h4>
              
              {cimitero.Indirizzo && (
                <p className="text-gray-400 text-sm truncate">{cimitero.Indirizzo}</p>
              )}
            </div>
            
            <ChevronRight className="flex-shrink-0 text-gray-500 ml-2" size={20} />
          </div>
        </div>
      ))}
    </div>
  );
};
