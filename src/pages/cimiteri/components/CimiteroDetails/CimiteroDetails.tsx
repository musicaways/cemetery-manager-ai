
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Cimitero } from "../../types";
import { InfoTab } from "./Tabs/InfoTab";
import { GalleryTab } from "./Tabs/GalleryTab";
import { DocumentsTab } from "./Tabs/DocumentsTab";
import { MapsTab } from "./Tabs/MapsTab";
import { SectorsTab } from "./Tabs/SectorsTab";
import { useState, useCallback } from "react";
import { CoverImage } from "./components/CoverImage";
import { MediaButtons } from "./components/MediaButtons";
import { EditButtons } from "./components/EditButtons";
import { useMediaQuery } from "@/hooks/use-media-query";
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
  const [activeTab, setActiveTab] = useState<'gallery' | 'documents' | 'maps' | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [openSection, setOpenSection] = useState<string | null>(null);

  const handleRefresh = useCallback(() => {
    // Implementare il refresh dei dati
  }, []);

  if (!cimitero) return null;

  return (
    <DialogContent className="flex flex-col h-[calc(100vh-32px)] md:h-[85vh] p-0 bg-[#1A1F2C] border-gray-800">
      {/* Header with close button */}
      <div className="relative flex-shrink-0">
        <DialogClose className="absolute right-4 top-4 z-50 rounded-full bg-black/40 p-2 hover:bg-black/60 transition-colors">
          <X className="h-5 w-5 text-white" />
        </DialogClose>
        
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
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-grow px-4 py-3">
        <div className="space-y-4">
          {/* Title */}
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-white">
              {cimitero.Descrizione}
            </DialogTitle>
          </DialogHeader>

          {/* Info Section */}
          <div className="rounded-lg bg-black/20 border border-gray-800 overflow-hidden">
            <InfoTab
              cimitero={cimitero}
              editMode={editMode}
              editedData={editedData}
              onInputChange={onInputChange}
            />
          </div>

          {/* Collapsible Media Sections */}
          <div className="space-y-2">
            {/* Gallery Section */}
            <Collapsible 
              open={openSection === 'gallery'} 
              onOpenChange={() => setOpenSection(openSection === 'gallery' ? null : 'gallery')}
            >
              <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between bg-black/20 border border-gray-800 rounded-lg hover:bg-gray-800/30 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">Galleria Foto</span>
                  {cimitero.foto?.length > 0 && (
                    <span className="px-2 py-0.5 text-xs bg-[var(--primary-color)] text-white rounded-full">
                      {cimitero.foto.length}
                    </span>
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <GalleryTab 
                  foto={cimitero.foto} 
                  onDelete={handleRefresh}
                  canEdit={editMode}
                />
              </CollapsibleContent>
            </Collapsible>

            {/* Documents Section */}
            <Collapsible 
              open={openSection === 'documents'} 
              onOpenChange={() => setOpenSection(openSection === 'documents' ? null : 'documents')}
            >
              <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between bg-black/20 border border-gray-800 rounded-lg hover:bg-gray-800/30 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">Documenti</span>
                  {cimitero.documenti?.length > 0 && (
                    <span className="px-2 py-0.5 text-xs bg-[var(--primary-color)] text-white rounded-full">
                      {cimitero.documenti.length}
                    </span>
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <DocumentsTab 
                  documenti={cimitero.documenti}
                  onDelete={handleRefresh}
                  canEdit={editMode}
                />
              </CollapsibleContent>
            </Collapsible>

            {/* Maps Section */}
            <Collapsible 
              open={openSection === 'maps'} 
              onOpenChange={() => setOpenSection(openSection === 'maps' ? null : 'maps')}
            >
              <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between bg-black/20 border border-gray-800 rounded-lg hover:bg-gray-800/30 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">Mappe</span>
                  {cimitero.mappe?.length > 0 && (
                    <span className="px-2 py-0.5 text-xs bg-[var(--primary-color)] text-white rounded-full">
                      {cimitero.mappe.length}
                    </span>
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <MapsTab 
                  mappe={cimitero.mappe}
                  onDelete={handleRefresh}
                  canEdit={editMode}
                />
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Sectors Section */}
          <div className="rounded-lg bg-black/20 border border-gray-800 p-3 mb-16">
            <h3 className="text-sm font-medium text-white mb-3">Settori</h3>
            <SectorsTab settori={cimitero.settori} />
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
