
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Cimitero } from "../../types";
import { useState, useCallback, useEffect } from "react";
import { CoverImage } from "./components/CoverImage";
import { EditButtons } from "./components/EditButtons";
import { Breadcrumb } from "./components/Breadcrumb";
import { CollapsibleSections } from "./components/CollapsibleSections";
import { Footer } from "./components/Footer";
import { X } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

interface CimiteroDetailsProps {
  cimitero: Cimitero | null;
  editMode: boolean;
  editedData: Partial<Cimitero>;
  onEdit: () => void;
  onSave: () => void;
  onUpload: () => void;
  onInputChange: (field: string, value: string | number | null) => void;
  selectedFile?: File | null;
  onRefresh: () => void;
}

export const CimiteroDetails = ({
  cimitero,
  editMode,
  editedData,
  onEdit,
  onSave,
  onUpload,
  onInputChange,
  selectedFile,
  onRefresh
}: CimiteroDetailsProps) => {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleRefresh = useCallback(() => {
    onRefresh();
  }, [onRefresh]);

  useEffect(() => {
    if (isMobile) {
      setOpenSection(null);
    }
  }, [isMobile]);

  if (!cimitero) return null;

  return (
    <DialogContent className={cn(
      "flex flex-col p-0 bg-[#1A1F2C] border-gray-800",
      "h-[calc(100vh-32px)] md:h-[85vh]",
      "transition-all duration-300",
      isMobile ? "w-full m-0 rounded-none" : "max-w-4xl"
    )}>
      <DialogClose className="absolute right-4 top-4 z-50 rounded-full bg-black/40 p-2 hover:bg-black/60 transition-colors">
        <X className="h-5 w-5 text-white" />
      </DialogClose>

      <ScrollArea className="flex-grow">
        <div>
          {/* Cover Image */}
          <div className="w-full aspect-[21/9] relative overflow-hidden">
            <CoverImage
              imageUrl={cimitero.FotoCopertina || cimitero.foto?.[0]?.Url}
              description={cimitero.Descrizione}
              editMode={editMode}
              onUpload={onUpload}
              selectedFile={selectedFile}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1F2C] to-transparent opacity-50" />
          </div>

          <div className="px-4 py-6 space-y-6">
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
          onSave={() => {
            onSave();
            handleRefresh();
          }}
        />
      </div>
    </DialogContent>
  );
};
