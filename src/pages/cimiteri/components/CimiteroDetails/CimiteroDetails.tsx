
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImagePlus, Save, Edit2, Image, File, Map } from "lucide-react";
import { Cimitero } from "../../types";
import { InfoTab } from "./Tabs/InfoTab";
import { GalleryTab } from "./Tabs/GalleryTab";
import { DocumentsTab } from "./Tabs/DocumentsTab";
import { MapsTab } from "./Tabs/MapsTab";
import { SectorsTab } from "./Tabs/SectorsTab";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { MediaUpload } from "@/components/MediaUpload";

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

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!editMode) return;

      const file = e.dataTransfer.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        toast.error('Per favore carica solo immagini');
        return;
      }

      onUpload();
    },
    [editMode, onUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

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

            <div className="pt-4 border-t border-gray-800">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Media e Documenti</h3>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-10 h-10 rounded-full bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 relative"
                  onClick={() => setActiveTab('gallery')}
                >
                  <Image className="w-4 h-4" />
                  {cimitero.foto?.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--primary-color)] text-white text-xs rounded-full flex items-center justify-center">
                      {cimitero.foto.length}
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-10 h-10 rounded-full bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 relative"
                  onClick={() => setActiveTab('documents')}
                >
                  <File className="w-4 h-4" />
                  {cimitero.documenti?.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--primary-color)] text-white text-xs rounded-full flex items-center justify-center">
                      {cimitero.documenti.length}
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-10 h-10 rounded-full bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 relative"
                  onClick={() => setActiveTab('maps')}
                >
                  <Map className="w-4 h-4" />
                  {cimitero.mappe?.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--primary-color)] text-white text-xs rounded-full flex items-center justify-center">
                      {cimitero.mappe.length}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            {editMode ? (
              <Button 
                onClick={onSave} 
                className="w-full h-11 bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90 shadow-lg"
              >
                <Save className="w-4 h-4 mr-2" />
                Salva modifiche
              </Button>
            ) : (
              <Button 
                onClick={onEdit} 
                className="w-full h-11 bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Modifica
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {/* Cover Image */}
            <div 
              className={`relative h-[300px] overflow-hidden group ${editMode && !cimitero.FotoCopertina ? 'cursor-pointer' : ''}`}
              onClick={() => {
                if (editMode && !cimitero.FotoCopertina) {
                  onUpload();
                }
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {(selectedFile || cimitero.FotoCopertina || cimitero.foto?.[0]?.Url) ? (
                <>
                  <img
                    src={selectedFile ? URL.createObjectURL(selectedFile) : (cimitero.FotoCopertina || cimitero.foto[0].Url)}
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
              
              {editMode && (cimitero.FotoCopertina || selectedFile) && (
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
