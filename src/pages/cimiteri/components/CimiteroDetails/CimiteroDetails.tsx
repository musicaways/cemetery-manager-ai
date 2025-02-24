
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImagePlus, Save, Edit2 } from "lucide-react";
import { Cimitero } from "../../types";
import { InfoTab } from "./Tabs/InfoTab";
import { GalleryTab } from "./Tabs/GalleryTab";
import { DocumentsTab } from "./Tabs/DocumentsTab";
import { MapsTab } from "./Tabs/MapsTab";
import { SectorsTab } from "./Tabs/SectorsTab";
import { useCallback } from "react";
import { toast } from "sonner";

interface CimiteroDetailsProps {
  cimitero: Cimitero | null;
  editMode: boolean;
  editedData: Partial<Cimitero>;
  onEdit: () => void;
  onSave: () => void;
  onUpload: () => void;
  onInputChange: (field: string, value: string | number | null) => void;
}

export const CimiteroDetails = ({
  cimitero,
  editMode,
  editedData,
  onEdit,
  onSave,
  onUpload,
  onInputChange,
}: CimiteroDetailsProps) => {
  if (!cimitero) return null;

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!editMode) return;

      const file = e.dataTransfer.files[0];
      if (!file) return;

      // Verifica che sia un'immagine
      if (!file.type.startsWith('image/')) {
        toast.error('Per favore carica solo immagini');
        return;
      }

      // Simula il click sul pulsante di upload
      onUpload();
    },
    [editMode, onUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  return (
    <DialogContent className="max-w-4xl bg-[#1A1F2C] border-gray-800 p-0">
      <DialogHeader className="p-6 pb-0">
        <DialogTitle className="text-2xl font-semibold text-white">
          {cimitero.Descrizione}
        </DialogTitle>
      </DialogHeader>
      
      <div 
        className={`relative aspect-[21/9] overflow-hidden group ${editMode && !cimitero.FotoCopertina ? 'cursor-pointer' : ''}`}
        onClick={() => {
          if (editMode && !cimitero.FotoCopertina) {
            onUpload();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {(cimitero.FotoCopertina || cimitero.foto?.[0]?.Url) ? (
          <>
            <img
              src={cimitero.FotoCopertina || cimitero.foto[0].Url}
              alt={cimitero.Descrizione || "Foto cimitero"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1F2C] via-transparent to-transparent" />
          </>
        ) : (
          <div className={`w-full h-full flex flex-col items-center justify-center ${editMode ? 'bg-black/40 hover:bg-black/50' : 'bg-black/20'} transition-colors`}>
            <ImagePlus className="w-12 h-12 text-white mb-2" />
            {editMode && (
              <p className="text-white text-sm">
                Clicca o trascina un'immagine qui per caricarla
              </p>
            )}
          </div>
        )}
        
        {editMode && cimitero.FotoCopertina && (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onUpload();
            }}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-black hover:text-black"
          >
            <ImagePlus className="w-4 h-4 mr-2" />
            Cambia foto
          </Button>
        )}
      </div>

      <ScrollArea className="h-[60vh]">
        <div className="p-6">
          <div className="space-y-6">
            <InfoTab
              cimitero={cimitero}
              editMode={editMode}
              editedData={editedData}
              onInputChange={onInputChange}
            />

            <GalleryTab foto={cimitero.foto} />
            <DocumentsTab documenti={cimitero.documenti} />
            <MapsTab mappe={cimitero.mappe} />
            <SectorsTab settori={cimitero.settori} />
          </div>
        </div>
      </ScrollArea>

      <div className="absolute bottom-6 right-6">
        {editMode ? (
          <Button 
            onClick={onSave} 
            className="h-12 w-12 rounded-full bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90 shadow-lg"
          >
            <Save className="w-5 h-5" />
          </Button>
        ) : (
          <Button 
            onClick={onEdit} 
            variant="outline" 
            className="h-12 w-12 rounded-full border-gray-700 shadow-lg"
          >
            <Edit2 className="w-5 h-5" />
          </Button>
        )}
      </div>
    </DialogContent>
  );
};
