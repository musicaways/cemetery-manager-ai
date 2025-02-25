
import { Dialog } from "@/components/ui/dialog";
import { MediaUpload } from "@/components/MediaUpload";
import { CimiteroDetails } from "./CimiteroDetails/CimiteroDetails";
import { useState } from "react";
import { Cimitero } from "../types";
import { useCimiteri } from "../hooks/useCimiteri";

interface CimiteroEditorProps {
  cimitero: Cimitero | null;
  onClose: () => void;
  onSave: (data: Partial<Cimitero>, coverImage?: File) => Promise<void>;
  onUploadComplete: (url: string) => Promise<void>;
}

export const CimiteroEditor = ({
  cimitero,
  onClose,
  onSave,
  onUploadComplete
}: CimiteroEditorProps) => {
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState<Partial<Cimitero>>({});
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { loadCimiteri } = useCimiteri();

  const handleEdit = () => {
    if (!cimitero) return;
    setEditMode(true);
    setEditedData({
      Descrizione: cimitero.Descrizione || "",
      Indirizzo: cimitero.Indirizzo || "",
      Latitudine: cimitero.Latitudine,
      Longitudine: cimitero.Longitudine,
      FotoCopertina: cimitero.FotoCopertina,
    });
  };

  const handleSave = async () => {
    if (!cimitero || !editedData) return;
    await onSave(editedData, selectedFile || undefined);
    setSelectedFile(null);
    setEditMode(false);
  };

  const handleInputChange = (field: string, value: string | number | null) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setIsUploadOpen(false);
  };

  const handleRefresh = async () => {
    await loadCimiteri();
  };

  return (
    <>
      <Dialog 
        open={!!cimitero} 
        onOpenChange={(open) => {
          if (!open) {
            onClose();
            setEditMode(false);
            setEditedData({});
            setSelectedFile(null);
          }
        }}
      >
        <CimiteroDetails
          cimitero={cimitero}
          editMode={editMode}
          editedData={editedData}
          onEdit={handleEdit}
          onSave={handleSave}
          onUpload={() => setIsUploadOpen(true)}
          onInputChange={handleInputChange}
          selectedFile={selectedFile}
          onRefresh={handleRefresh}
        />
      </Dialog>

      <MediaUpload 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleFileSelect}
      />
    </>
  );
};
