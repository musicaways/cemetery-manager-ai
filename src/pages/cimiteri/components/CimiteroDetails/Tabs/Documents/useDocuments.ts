
import { useState } from "react";
import { CimiteroDocumenti } from "../../../../types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const useDocuments = (
  initialDocuments: CimiteroDocumenti[],
  cimiteroId: number,
  onUploadComplete: () => void,
  onDelete?: () => void
) => {
  const [localDocumenti, setLocalDocumenti] = useState<CimiteroDocumenti[]>(initialDocuments);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async (id: string) => {
    try {
      console.log("Deleting document with ID:", id);
      
      const documentToDelete = localDocumenti.find(d => d.Id === id);
      if (!documentToDelete) {
        throw new Error("Documento non trovato");
      }

      const fileUrl = new URL(documentToDelete.Url);
      const filePath = fileUrl.pathname.split('/').pop();
      
      if (filePath) {
        console.log("Removing file from storage:", filePath);
        const { error: storageError } = await supabase.storage
          .from('cemetery-documents')
          .remove([filePath]);

        if (storageError) {
          console.error("Storage deletion error:", storageError);
          throw storageError;
        }
      }

      console.log("Deleting document from database");
      const { error: dbError } = await supabase
        .from('CimiteroDocumenti')
        .delete()
        .eq('Id', id);

      if (dbError) {
        console.error("Database deletion error:", dbError);
        throw dbError;
      }
      
      setLocalDocumenti(prevDocs => prevDocs.filter(d => d.Id !== id));
      await queryClient.invalidateQueries({ queryKey: ['cimiteri'] });
      await onUploadComplete();
      
      if (onDelete) {
        onDelete();
      }
      toast.success("Documento eliminato con successo");
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast.error("Errore durante l'eliminazione del documento: " + (error.message || 'Errore sconosciuto'));
    }
  };

  const handleFileSelect = async (file: File) => {
    let toastId: string | number = '';
    try {
      if (!file) {
        throw new Error("Nessun file selezionato");
      }

      console.log("Starting file upload:", { name: file.name, type: file.type, size: file.size });
      setIsUploading(true);
      toastId = toast.loading("Caricamento in corso...");

      const fileExt = file.name.split('.').pop();
      if (!fileExt) {
        throw new Error("Estensione file non valida");
      }

      const sanitizedFileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${cimiteroId}/${sanitizedFileName}`;

      console.log("Uploading file to path:", filePath);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('cemetery-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      console.log("File uploaded successfully:", uploadData);

      const { data: { publicUrl } } = supabase.storage
        .from('cemetery-documents')
        .getPublicUrl(filePath);

      console.log("Got public URL:", publicUrl);

      const { data: newDoc, error: dbError } = await supabase
        .from('CimiteroDocumenti')
        .insert({
          IdCimitero: cimiteroId,
          Url: publicUrl,
          NomeFile: file.name,
          TipoFile: file.type,
        })
        .select()
        .single();

      if (dbError) {
        console.error("Database insert error:", dbError);
        // Se c'è un errore nel database, eliminiamo il file caricato
        await supabase.storage
          .from('cemetery-documents')
          .remove([filePath]);
        throw dbError;
      }

      console.log("Document metadata saved:", newDoc);

      setLocalDocumenti(prevDocs => [...prevDocs, newDoc]);
      await queryClient.invalidateQueries({ queryKey: ['cimiteri'] });
      await onUploadComplete();

      toast.dismiss(toastId);
      toast.success("Documento caricato con successo");
    } catch (error: any) {
      console.error("Error uploading document:", error);
      toast.error("Errore durante il caricamento del documento: " + (error.message || 'Errore sconosciuto'));
      toast.dismiss(toastId);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    localDocumenti,
    isUploading,
    handleDelete,
    handleFileSelect
  };
};
