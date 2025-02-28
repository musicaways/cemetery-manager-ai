
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Cimitero } from "@/pages/cimiteri/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface CimiteroDetailsDialogProps {
  cimitero: Cimitero | null;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CimiteroDetailsDialog = ({ cimitero, isOpen = false, onOpenChange }: CimiteroDetailsDialogProps) => {
  const [open, setOpen] = useState(isOpen);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (onOpenChange) {
      onOpenChange(value);
    }
  };

  if (!cimitero) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{cimitero.Descrizione}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Codice: {cimitero.Codice}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] mt-4 pr-4">
          <div className="space-y-4">
            {cimitero.FotoCopertina && (
              <div className="mb-4">
                <img 
                  src={cimitero.FotoCopertina} 
                  alt={cimitero.Descrizione} 
                  className="w-full h-64 object-cover rounded-md"
                />
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-medium mb-2">Informazioni</h3>
              <div className="space-y-2 text-gray-300">
                <p><span className="font-medium">Indirizzo:</span> {cimitero.Indirizzo || "Non disponibile"}</p>
                <p><span className="font-medium">Coordinate:</span> {cimitero.Latitudine}, {cimitero.Longitudine}</p>
              </div>
            </div>
            
            {cimitero.settori && cimitero.settori.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Settori</h3>
                <ul className="space-y-2">
                  {cimitero.settori.map((settore) => (
                    <li key={settore.Id} className="p-2 bg-gray-800 rounded-md">
                      <p className="font-medium">{settore.Descrizione}</p>
                      {settore.blocchi && settore.blocchi.length > 0 && (
                        <div className="mt-2 pl-4">
                          <p className="text-sm text-gray-400">Blocchi: {settore.blocchi.length}</p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {cimitero.foto && cimitero.foto.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Galleria</h3>
                <div className="grid grid-cols-2 gap-2">
                  {cimitero.foto.slice(0, 4).map((foto) => (
                    <div key={foto.Id} className="aspect-square overflow-hidden rounded-md">
                      <img 
                        src={foto.Url} 
                        alt={foto.Descrizione || "Foto cimitero"} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                {cimitero.foto.length > 4 && (
                  <p className="text-sm text-gray-400 mt-2">+ altre {cimitero.foto.length - 4} foto</p>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="flex justify-end mt-4">
          <Button
            variant="secondary"
            onClick={() => handleOpenChange(false)}
          >
            Chiudi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
