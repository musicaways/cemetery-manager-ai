
import { Image } from "lucide-react";
import { useState } from "react";
import { CimiteroFoto } from "../../../types";
import { MediaViewer } from "../components/MediaViewer";
import { FileUploadZone } from "../components/FileUploadZone";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GalleryTabProps {
  foto: CimiteroFoto[];
  onDelete?: () => void;
  canEdit?: boolean;
  cimiteroId: number;
  onUploadComplete: () => void;
}

export const GalleryTab = ({ foto, onDelete, canEdit, cimiteroId, onUploadComplete }: GalleryTabProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('CimiteroFoto')
        .delete()
        .eq('Id', id);

      if (error) throw error;
      
      if (onDelete) {
        onDelete();
      }
      toast.success("Foto eliminata con successo");
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast.error("Errore durante l'eliminazione della foto");
    }
  };

  const handleFileSelect = async (file: File) => {
    try {
      setIsUploading(true);
      toast.loading("Caricamento in corso...");

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${cimiteroId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('cemetery-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('cemetery-photos')
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase
        .from('CimiteroFoto')
        .insert({
          IdCimitero: cimiteroId,
          Url: publicUrl,
          NomeFile: file.name,
          TipoFile: file.type,
        });

      if (dbError) throw dbError;

      toast.dismiss();
      toast.success("Foto caricata con successo");
      onUploadComplete();
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast.error("Errore durante il caricamento della foto");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {canEdit && (
        <FileUploadZone
          onFileSelect={handleFileSelect}
          accept="image/*"
          maxSize={5}
          disabled={isUploading}
        />
      )}

      {foto?.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {foto.map((foto, index) => (
            <div 
              key={foto.Id} 
              className="relative group aspect-video rounded-lg overflow-hidden border border-gray-800 hover:border-[var(--primary-color)] transition-colors cursor-pointer"
              onClick={() => setSelectedIndex(index)}
            >
              <img
                src={foto.Url}
                alt={foto.Descrizione || "Foto cimitero"}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      ) : (
        !canEdit && (
          <div className="text-center py-8 text-gray-500">
            Nessuna foto disponibile
          </div>
        )
      )}

      <MediaViewer
        items={foto}
        currentIndex={selectedIndex ?? 0}
        isOpen={selectedIndex !== null}
        onClose={() => setSelectedIndex(null)}
        onDelete={canEdit ? handleDelete : undefined}
        canDelete={canEdit}
      />
    </div>
  );
};
