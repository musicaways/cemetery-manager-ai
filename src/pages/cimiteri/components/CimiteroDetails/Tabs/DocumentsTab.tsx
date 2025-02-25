
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
    <div className="space-y-4">
      {canEdit && (
        <FileUploadZone
          onFileSelect={handleFileSelect}
          accept=".pdf,.doc,.docx,.xls,.xlsx"
          maxSize={10}
        />
      )}

      {documenti?.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {documenti.map((documento, index) => (
            <div 
              key={documento.Id} 
              className="relative group p-4 rounded-lg border border-gray-800 hover:border-[var(--primary-color)] transition-colors cursor-pointer bg-black/20"
              onClick={() => setSelectedIndex(index)}
            >
              <div className="flex items-center space-x-3">
                <File className="w-8 h-8 text-[var(--primary-color)]" />
                <div className="overflow-hidden">
                  <p className="text-sm text-gray-200 truncate">{documento.NomeFile}</p>
                  <p className="text-xs text-gray-500">{documento.TipoFile}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !canEdit && (
          <div className="text-center py-8 text-gray-500">
            Nessun documento disponibile
          </div>
        )
      )}

      <MediaViewer
        items={documenti}
        currentIndex={selectedIndex ?? 0}
        isOpen={selectedIndex !== null}
        onClose={() => setSelectedIndex(null)}
        onDelete={canEdit ? handleDelete : undefined}
        canDelete={canEdit}
      />
    </div>
  );
};
