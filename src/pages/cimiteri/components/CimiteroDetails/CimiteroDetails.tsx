
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Cimitero } from "../../types";
import { InfoTab } from "./Tabs/InfoTab";
import { GalleryTab } from "./Tabs/GalleryTab";
import { DocumentsTab } from "./Tabs/DocumentsTab";
import { MapsTab } from "./Tabs/MapsTab";
import { SectorsTab } from "./Tabs/SectorsTab";
import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { CoverImage } from "./components/CoverImage";
import { MediaButtons } from "./components/MediaButtons";
import { EditButtons } from "./components/EditButtons";

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

  if (!cimitero) return null;

  return (
    <DialogContent className="max-w-5xl bg-[#1A1F2C] border-gray-800 p-0 overflow-hidden">
      <div className="flex h-[85vh]">
        {/* Sidebar */}
        <div className="w-[280px] border-r border-gray-800 bg-black/20 p-6 flex flex-col">
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
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <CoverImage
              imageUrl={cimitero.FotoCopertina || cimitero.foto?.[0]?.Url}
              description={cimitero.Descrizione}
              editMode={editMode}
              onUpload={onUpload}
              selectedFile={selectedFile}
            />

            {/* Content Area */}
            <div className="p-6">
              <SectorsTab settori={cimitero.settori} />
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Media Modal */}
      <Dialog open={!!activeTab} onOpenChange={() => setActiveTab(null)}>
        <DialogContent className="max-w-4xl bg-[#1A1F2C] border-gray-800">
          <DialogHeader>
            <DialogTitle>
              {activeTab === 'gallery' && 'Galleria Foto'}
              {activeTab === 'documents' && 'Documenti'}
              {activeTab === 'maps' && 'Mappe'}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {activeTab === 'gallery' && <GalleryTab foto={cimitero.foto} />}
            {activeTab === 'documents' && <DocumentsTab documenti={cimitero.documenti} />}
            {activeTab === 'maps' && <MapsTab mappe={cimitero.mappe} />}
          </div>
        </DialogContent>
      </Dialog>
    </DialogContent>
  );
};
