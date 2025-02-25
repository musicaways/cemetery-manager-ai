
import { File, FileImage, FileText, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { CimiteroDocumenti } from "../../../types";
import { MediaViewer } from "../components/MediaViewer";
import { FileUploadZone } from "../components/FileUploadZone";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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
  const [localDocumenti, setLocalDocumenti] = useState<CimiteroDocumenti[]>(documenti);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const getFileIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type.includes('image')) return <FileImage className="w-8 h-8 text-blue-400" />;
    if (type.includes('pdf')) return <FileText className="w-8 h-8 text-red-400" />;
    if (type.includes('excel') || type.includes('spreadsheet') || type.includes('sheet')) 
      return <FileSpreadsheet className="w-8 h-8 text-green-400" />;
    return <File className="w-8 h-8 text-[var(--primary-color)]" />;
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDocumentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      console.log("Deleting document with ID:", id);
      
      // Troviamo prima l'URL del file per eliminarlo dallo storage
      const documentToDelete = localDocumenti.find(d => d.Id === id);
      if (!documentToDelete) {
        throw new Error("Documento non trovato");
      }

      // Estraiamo il path del file dall'URL
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
      console.log("Starting file upload:", { name: file.name, type: file.type, size: file.size });
      setIsUploading(true);
      toastId = toast.loading("Caricamento in corso...");

      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${cimiteroId}/${fileName}`;

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

  return (
    <div className="space-y-4">
      {canEdit && (
        <FileUploadZone
          onFileSelect={handleFileSelect}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.bmp,.gif,.jpg,.jpeg,.png"
          maxSize={10}
          disabled={isUploading}
        />
      )}

      {localDocumenti?.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {localDocumenti.map((documento, index) => (
            <div 
              key={documento.Id} 
              className="relative group p-4 rounded-lg border border-gray-800/50 hover:border-[var(--primary-color)] transition-all duration-300 cursor-pointer hover:scale-[0.98] bg-black/20"
              onClick={() => setSelectedIndex(index)}
            >
              <div className="flex items-center space-x-3">
                {getFileIcon(documento.TipoFile)}
                <div className="overflow-hidden flex-1">
                  <p className="text-sm text-gray-200 truncate">{documento.NomeFile}</p>
                  <p className="text-xs text-gray-500">{documento.TipoFile}</p>
                </div>
              </div>

              {canEdit && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleDeleteClick(documento.Id, e)}
                    className="p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-full backdrop-blur-sm transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
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
        items={localDocumenti}
        currentIndex={selectedIndex ?? 0}
        isOpen={selectedIndex !== null}
        onClose={() => setSelectedIndex(null)}
        onDelete={canEdit ? handleDelete : undefined}
        canDelete={canEdit}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#1A1F2C] border border-[var(--primary-color)]/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-xl">
              Conferma eliminazione
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/80 text-base">
              Sei sicuro di voler eliminare questo documento? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setDocumentToDelete(null)}
              className="bg-transparent border border-white/20 text-white hover:bg-white/10"
            >
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (documentToDelete) {
                  handleDelete(documentToDelete);
                  setDocumentToDelete(null);
                  setDeleteDialogOpen(false);
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white font-medium"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
