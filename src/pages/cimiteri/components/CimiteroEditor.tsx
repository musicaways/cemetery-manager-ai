
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { MediaUpload } from "@/components/MediaUpload";
import { CimiteroDetails } from "./CimiteroDetails/CimiteroDetails";
import { useState } from "react";
import { Cimitero } from "../types";
import { useCimiteri } from "../hooks/useCimiteri";
import { toast } from "sonner";

interface CimiteroEditorProps {
  cimitero: Cimitero | null;
  onClose: () => void;
  onSave: (data: Partial<Cimitero>, coverImage?: File) => Promise<void>;
  onUploadComplete: (url: string) => Promise<void>;
  isOnline?: boolean;
}

export const CimiteroEditor = ({
  cimitero,
  onClose,
  onSave,
  onUploadComplete,
  isOnline = true
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
    try {
      await onSave(editedData, selectedFile || undefined);
      setSelectedFile(null);
      setEditMode(false);
      toast.success("Modifiche salvate con successo");
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
      toast.error("Errore durante il salvataggio", {
        description: "Si è verificato un errore durante il salvataggio delle modifiche."
      });
    }
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
    try {
      await loadCimiteri();
    } catch (error) {
      console.error("Errore durante il refresh dei dati:", error);
    }
  };

  if (!cimitero) return null;

  return (
    <>
      <Dialog open={!!cimitero} onOpenChange={onClose}>
        <DialogContent className="p-0 max-w-4xl bg-transparent border-none">
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
            onClose={onClose}
          />
        </DialogContent>
      </Dialog>

      <MediaUpload 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleFileSelect}
      />
    </>
  );
};
