
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { CimiteroFoto } from "../../../../types";
import { compressImage } from "./ImageCompressor";

export const useGallery = (
  initialFoto: CimiteroFoto[],
  cimiteroId: number,
  onUploadComplete: () => void,
  onDelete?: () => void
) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [localFoto, setLocalFoto] = useState<CimiteroFoto[]>(initialFoto);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('CimiteroFoto')
        .delete()
        .eq('Id', id);

      if (error) throw error;
      
      setLocalFoto(prevFoto => prevFoto.filter(f => f.Id !== id));
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
    let toastId: string | number = '';
    try {
      setIsUploading(true);
      toastId = toast.loading("Elaborazione immagine in corso...");

      let fileToUpload: File | Blob = file;
      if (file.size > 5 * 1024 * 1024) {
        const compressedBlob = await compressImage(file, 5);
        fileToUpload = compressedBlob;
        
        const compressionRatio = ((file.size - compressedBlob.size) / file.size * 100).toFixed(1);
        console.log(`Immagine compressa: ${compressionRatio}% di riduzione`);
      }

      toast.loading("Caricamento in corso...", {
        id: toastId
      });

      const fileExt = file.name.split('.').pop();
      const filePath = `${cimiteroId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('cemetery-photos')
        .upload(filePath, fileToUpload);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('cemetery-photos')
        .getPublicUrl(filePath);

      const { data: newFoto, error: dbError } = await supabase
        .from('CimiteroFoto')
        .insert({
          IdCimitero: cimiteroId,
          Url: publicUrl,
          NomeFile: file.name,
          TipoFile: file.type,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setLocalFoto(prevFoto => [...prevFoto, newFoto]);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['cimiteri'] }),
        onUploadComplete()
      ]);

      toast.dismiss(toastId);
      toast.success("Foto caricata con successo");
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast.error("Errore durante il caricamento della foto: " + (error.message || 'Errore sconosciuto'));
      toast.dismiss(toastId);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    selectedIndex,
    setSelectedIndex,
    isUploading,
    localFoto,
    deleteDialogOpen,
    setDeleteDialogOpen,
    photoToDelete,
    setPhotoToDelete,
    handleDeleteClick,
    handleDelete,
    handleFileSelect
  };
};
