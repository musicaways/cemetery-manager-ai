
import { File } from "lucide-react";
import { useState } from "react";
import { CimiteroDocumenti } from "../../../types";
import { MediaViewer } from "../components/MediaViewer";
import { FileUploadZone } from "../components/FileUploadZone";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DocumentsTabProps {
  documenti: CimiteroDocumenti[];
  onDelete?: () => void;
  canEdit?: boolean;
  cimiteroId: number;
  onUploadComplete: () => void;
}

export const DocumentsTab = ({ documenti, onDelete, canEdit, cimiteroId, onUploadComplete }: DocumentsTabProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('CimiteroDocumenti')
        .delete()
        .eq('Id', id);

      if (error) throw error;
      
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  };

  const handleFileSelect = async (file: File) => {
    try {
      setIsUploading(true);
      toast.loading("Caricamento in corso...");

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${cimiteroId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('cemetery-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('cemetery-documents')
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase
        .from('CimiteroDocumenti')
        .insert({
          CimiteroId: cimiteroId,
          Url: publicUrl,
          NomeFile: file.name,
          TipoFile: file.type,
        });

      if (dbError) throw dbError;

      toast.dismiss();
      toast.success("Documento caricato con successo");
      onUploadComplete();
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Errore durante il caricamento del documento");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space