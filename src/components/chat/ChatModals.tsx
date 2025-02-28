
import { useState } from "react";
import { MediaUpload } from "@/components/MediaUpload";
import { FunctionsModal } from "@/components/FunctionsModal";
import { Dialog } from "@/components/ui/dialog";
import { CimiteroDetails } from "@/pages/cimiteri/components/CimiteroDetails/CimiteroDetails";
import type { Cimitero } from "@/pages/cimiteri/types";
import { toast } from "sonner";

interface ChatModalsProps {
  isMediaUploadOpen: boolean;
  isFunctionsOpen: boolean;
  onMediaUploadClose: () => void;
  onFunctionsClose: () => void;
  onMediaUpload: (url: string) => void;
  onFunctionSelect: (functionType: string) => void;
  selectedCimitero?: Cimitero | null;
  onCimiteroEditorClose?: () => void;
}

export const ChatModals = ({
  isMediaUploadOpen,
  isFunctionsOpen,
  onMediaUploadClose,
  onFunctionsClose,
  onMediaUpload,
  onFunctionSelect,
  selectedCimitero,
  onCimiteroEditorClose
}: ChatModalsProps) => {
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState<Partial<Cimitero>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSave = async () => {
    // In modalità chat, non permettiamo la modifica
    toast.info("La modifica non è disponibile in modalità chat");
    setEditMode(false);
  };

  const handleEdit = () => {
    // Non permettiamo l'edit in modalità chat
    toast.info("La modifica non è disponibile in modalità chat");
  };

  const handleInputChange = (field: string, value: string | number | null) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpload = () => {
    // Non implementato nella chat
    toast.info("Upload non disponibile in modalità chat");
  };

  const handleRefresh = () => {
    // Non implementato nella chat
  };

  return (
    <>
      <MediaUpload 
        isOpen={isMediaUploadOpen}
        onClose={onMediaUploadClose}
        onUpload={(url) => onMediaUpload(`Analizza questa immagine: ${url}`)}
      />

      <FunctionsModal
        isOpen={isFunctionsOpen}
        onClose={onFunctionsClose}
        onFunctionSelect={onFunctionSelect}
      />

      {selectedCimitero && (
        <Dialog 
          open={!!selectedCimitero} 
          onOpenChange={(open) => {
            if (!open && onCimiteroEditorClose) {
              onCimiteroEditorClose();
              setEditMode(false);
              setEditedData({});
            }
          }}
        >
          <CimiteroDetails
            cimitero={selectedCimitero}
            editMode={editMode}
            editedData={editedData}
            onEdit={handleEdit}
            onSave={handleSave}
            onUpload={handleUpload}
            onInputChange={handleInputChange}
            selectedFile={selectedFile}
            onRefresh={handleRefresh}
          />
        </Dialog>
      )}
    </>
  );
};
