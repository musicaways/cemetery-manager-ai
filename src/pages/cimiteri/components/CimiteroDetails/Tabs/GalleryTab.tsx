
import { Image } from "lucide-react";
import { useState } from "react";
import { CimiteroFoto } from "../../../types";
import { MediaViewer } from "../components/MediaViewer";
import { FileUploadZone } from "../components/FileUploadZone";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('CimiteroFoto')
        .delete()
        .eq('Id', id);

      if (error) throw error;
      
      await queryClient.invalidateQueries({ queryKey: ['cimiteri'] });
      await onUploadComplete();
      
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
      const loadingToast = toast.loading("Caricamento in corso...");

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

      // Forza l'aggiornamento dei dati
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['cimiteri'] }),
        onUploadComplete()
      ]);

      toast.dismiss(loadingToast);
      toast.success("Foto caricata con successo");
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
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {foto.map((foto, index) => (
            <div 
              key={foto.Id} 
              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-800/50 hover:border-[var(--primary-color)] transition-all duration-300 cursor-pointer hover:scale-[0.98] bg-black/20"
              onClick={() => setSelectedIndex(index)}
            >
              <img
                src={foto.Url}
                alt={foto.Descrizione || "Foto cimitero"}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-1 right-1 bg-black/50 backdrop-blur-sm p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Image className="w-3 h-3 text-white" />
              </div>
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
