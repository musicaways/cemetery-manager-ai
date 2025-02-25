
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Cimitero } from "../../types";
import { InfoTab } from "./Tabs/InfoTab";
import { GalleryTab } from "./Tabs/GalleryTab";
import { DocumentsTab } from "./Tabs/DocumentsTab";
import { MapsTab } from "./Tabs/MapsTab";
import { SectorsTab } from "./Tabs/SectorsTab";
import { useState, useCallback } from "react";
import { CoverImage } from "./components/CoverImage";
import { EditButtons } from "./components/EditButtons";
import { ChevronRight, Home, X } from "lucide-react";

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
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-1 text-sm text-gray-400 mb-4">
              <div className="flex items-center">
                <Home className="h-4 w-4" />
                <ChevronRight className="h-4 w-4" />
                <span>Cimiteri</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-300">{cimitero.Descrizione}</span>
              </div>
            </nav>

            {/* Collapsible Sections */}
            <div className="space-y-2">
              {/* Info Section */}
              <Collapsible 
                open={openSection === 'info'} 
                onOpenChange={() => setOpenSection(openSection === 'info' ? null : 'info')}
              >
                <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between bg-black/20 border border-gray-800 rounded-lg hover:bg-gray-800/30 transition-colors">
                  <span className="text-sm font-medium text-white">Informazioni</span>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <InfoTab
                    cimitero={cimitero}
                    editMode={editMode}
                    editedData={editedData}
                    onInputChange={onInputChange}
                  />
                </CollapsibleContent>
              </Collapsible>

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
                    cimiteroId={cimitero.Id}
                    onUploadComplete={handleRefresh}
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
                    cimiteroId={cimitero.Id}
                    onUploadComplete={handleRefresh}
                  />
                </CollapsibleContent>
              </Collapsible>

              {/* Maps Section */}
              <Collapsible 
                open={openSection === 'maps'} 
                onOpenChange={() => setOpenSection(openSection === 'maps' ? null : 'maps')}
              >
                <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between bg-black/20 border border-gray-800 rounded-lg hover:bg-gray-800/30 transition-colors">
                  <span className="text-sm font-medium text-white">Mappa</span>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <MapsTab 
                    mappe={cimitero.mappe}
                    onDelete={handleRefresh}
                    canEdit={editMode}
                    latitude={cimitero.Latitudine}
                    longitude={cimitero.Longitudine}
                  />
                </CollapsibleContent>
              </Collapsible>

              {/* Sectors Section */}
              <Collapsible 
                open={openSection === 'sectors'} 
                onOpenChange={() => setOpenSection(openSection === 'sectors' ? null : 'sectors')}
              >
                <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between bg-black/20 border border-gray-800 rounded-lg hover:bg-gray-800/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">Settori</span>
                    {cimitero.settori?.length > 0 && (
                      <span className="px-2 py-0.5 text-xs bg-[var(--primary-color)] text-white rounded-full">
                        {cimitero.settori.length}
                      </span>
                    )}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <SectorsTab settori={cimitero.settori} />
                </CollapsibleContent>
              </Collapsible>

              {/* Footer */}
              <div className="mt-8 mb-16 px-3 py-4 bg-black/30 rounded-lg border-t border-gray-800/50">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-8 h-1 bg-gray-800/50 rounded-full"></div>
                </div>
              </div>
            </div>
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
