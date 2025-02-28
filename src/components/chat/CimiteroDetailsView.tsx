
import { useState } from "react";
import { Cimitero } from "@/pages/cimiteri/types";
import { CimiteroDetails } from "@/pages/cimiteri/components/CimiteroDetails/CimiteroDetails";
import { toast } from "sonner";

interface CimiteroDetailsViewProps {
  cimitero: Cimitero;
  onClose: () => void;
}

export const CimiteroDetailsView = ({ cimitero, onClose }: CimiteroDetailsViewProps) => {
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState<Partial<Cimitero>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleEdit = () => {
    toast.info("La modifica non è disponibile in modalità chat");
  };

  const handleSave = async () => {
    toast.info("La modifica non è disponibile in modalità chat");
    setEditMode(false);
  };

  const handleInputChange = (field: string, value: string | number | null) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpload = () => {
    toast.info("Upload non disponibile in modalità chat");
  };

  const handleRefresh = () => {
    // Non implementato nella chat
  };

  return (
    <CimiteroDetails
      cimitero={cimitero}
      editMode={editMode}
      editedData={editedData}
      onEdit={handleEdit}
      onSave={handleSave}
      onUpload={handleUpload}
      onInputChange={handleInputChange}
      selectedFile={selectedFile}
      onRefresh={handleRefresh}
    />
  );
};
