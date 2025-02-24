
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

  return (
    <DialogContent className="max-w-4xl bg-[#1A1F2C] border-gray-800 p-0">
      <DialogHeader className="p-6 pb-0">
        <DialogTitle className="text-2xl font-semibold text-white">
          {cimitero.Descrizione}
        </DialogTitle>
      </DialogHeader>
      
      <div className="relative aspect-[21/9] overflow-hidden group">
        {(cimitero.FotoCopertina || cimitero.foto?.[0]?.Url) ? (
          <img
            src={cimitero.FotoCopertina || cimitero.foto[0].Url}
            alt={cimitero.Descrizione || "Foto cimitero"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black/20">
            <ImagePlus className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1F2C] to-transparent" />
        {editMode && (
          <Button
            onClick={onUpload}
            className="absolute top-4 right-4 bg-black/60 hover:bg-black/80"
          >
            <ImagePlus className="w-4 h-4 mr-2" />
            Cambia foto
          </Button>
        )}
      </div>

      <ScrollArea className="h-[60vh]">
        <div className="p-6">
          <div className="space-y-6">
            <div className="flex justify-end space-x-2">
              {editMode ? (
                <Button onClick={onSave} className="bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90">
                  <Save className="w-4 h-4 mr-2" />
                  Salva
                </Button>
              ) : (
                <Button onClick={onEdit} variant="outline" className="border-gray-700">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Modifica
                </Button>
              )}
            </div>

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
    </DialogContent>
  );
};
