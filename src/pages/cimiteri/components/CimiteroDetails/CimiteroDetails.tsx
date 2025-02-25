import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Cimitero } from "../../types";
import { useState, useCallback } from "react";
import { CoverImage } from "./components/CoverImage";
import { EditButtons } from "./components/EditButtons";
import { Breadcrumb } from "./components/Breadcrumb";
import { CollapsibleSections } from "./components/CollapsibleSections";
import { Footer } from "./components/Footer";
import { X } from "lucide-react";

interface CimiteroDetailsProps {
  cimitero: Cimitero | null;
  editMode: boolean;
  editedData: Partial<Cimitero>;
  onEdit: () => void;
  onSave: () => void;
  onUpload: () => void;
  onInputChange: (field: string, value: string | number | null) => void;
  selectedFile?: File | null;
}

export const CimiteroDetails = ({
  cimitero,
  editMode,
  editedData,
  onEdit,
  onSave,
  onUpload,
  onInputChange,
  selectedFile
}: CimiteroDetailsProps) => {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const handleRefresh = useCallback(() => {
    // Implementare il refresh dei dati
  }, []);

  if (!cimitero) return null;

  return (
    <DialogContent className="flex flex-col h-[calc(100vh-32px)] md:h-[85vh] p-0 bg-[#1A1F2C] border-gray-800">
      <DialogClose className="absolute right-2 top-2 z-50 rounded-full bg-black/40 p-2 hover:bg-black/60 transition-colors">
        <X className="h-5 w-5 text-white" />
      </DialogClose>

      <ScrollArea className="flex-grow">
        <div className="space-y-4">
          {/* Cover Image */}
          <div className="w-full aspect-[21/9]">
            <CoverImage
              imageUrl={cimitero.FotoCopertina || cimitero.foto?.[0]?.Url}
              description={cimitero.Descrizione}
              editMode={editMode}
              onUpload={onUpload}
              selectedFile={selectedFile}
            />
          </div>

          <div className="px-2">
            <Breadcrumb description={cimitero.Descrizione} />
            
            <CollapsibleSections
              cimitero={cimitero}
              openSection={openSection}
              setOpenSection={setOpenSection}
              editMode={editMode}
              editedData={editedData}
              onInputChange={onInputChange}
              handleRefresh={handleRefresh}
            />

            <Footer />
          </div>
        </div>
      </ScrollArea>

      {/* Edit Button */}
      <div className="absolute bottom-4 right-4">
        <EditButtons 
          editMode={editMode}
          onEdit={onEdit}
          onSave={onSave}
        />
      </div>
    </DialogContent>
  );
};
