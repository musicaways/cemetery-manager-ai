
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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

  const handleRefresh = useCallback(() => {
    // Implementare il refresh dei dati
  }, []);

  if (!cimitero) return null;

  const MediaContent = () => (
    <div className="flex-1 overflow-auto">
      <DialogHeader className="mb-4">
        <DialogTitle className="text-white">
          {activeTab === 'gallery' && 'Galleria Foto'}
          {activeTab === 'documents' && 'Documenti'}
          {activeTab === 'maps' && 'Mappe'}
        </DialogTitle>
      </DialogHeader>
      {activeTab === 'gallery' && (
        <GalleryTab 
          foto={cimitero.foto} 
          onDelete={handleRefresh}
          canEdit={editMode}
        />
      )}
      {activeTab === 'documents' && (
        <DocumentsTab 
          documenti={cimitero.documenti}
          onDelete={handleRefresh}
          canEdit={editMode}
        />
      )}
      {activeTab === 'maps' && (
        <MapsTab 
          mappe={cimitero.mappe}
          onDelete={handleRefresh}
          canEdit={editMode}
        />
      )}
    </div>
  );

  const MainContent = () => (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <CoverImage
          imageUrl={cimitero.FotoCopertina || cimitero.foto?.[0]?.Url}
          description={cimitero.Descrizione}
          editMode={editMode}
          onUpload={onUpload}
          selectedFile={selectedFile}
        />
        <div className="p-6">
          <SectorsTab settori={cimitero.settori} />
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <DialogContent className={`
      max-w-5xl 
      bg-[#1A1F2C] 
      border-gray-800 
      p-0 
      overflow-hidden
      ${isMobile ? 'h-[100dvh]' : 'h-[85vh]'}
    `}>
      <div className={`
        flex
        ${isMobile ? 'flex-col h-full' : 'h-[85vh]'}
      `}>
        {/* Sidebar - diventa header su mobile */}
        <div className={`
          ${isMobile ? 'w-full border-b' : 'w-[280px] border-r'} 
          border-gray-800 
          bg-black/20 
          p-6 
          flex 
          flex-col
        `}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">
              {cimitero.Descrizione}
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-8 space-y-6">
            <InfoTab
              cimitero={cimitero}
              editMode={editMode}
              editedData={editedData}
              onInputChange={onInputChange}
            />

            <MediaButtons 
              cimitero={cimitero}
              onTabChange={setActiveTab}
            />
          </div>

          <EditButtons 
            editMode={editMode}
            onEdit={onEdit}
            onSave={onSave}
          />
        </div>

        {/* Main Content */}
        {!activeTab && <MainContent />}
        {activeTab && (isMobile ? (
          <Sheet open={!!activeTab} onOpenChange={() => setActiveTab(null)}>
            <SheetContent side="bottom" className="h-[80vh] bg-[#1A1F2C] border-t border-gray-800 p-6">
              <MediaContent />
            </SheetContent>
          </Sheet>
        ) : (
          <Dialog open={!!activeTab} onOpenChange={() => setActiveTab(null)}>
            <DialogContent className="max-w-4xl bg-[#1A1F2C] border-gray-800">
              <MediaContent />
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </DialogContent>
  );
};
