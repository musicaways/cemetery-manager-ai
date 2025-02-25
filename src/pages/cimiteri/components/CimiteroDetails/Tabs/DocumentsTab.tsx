
import { File, Trash2 } from "lucide-react";
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
    if (type.includes('image')) return 'image';
    if (type.includes('pdf')) return 'pdf';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'excel';
    if (type.includes('word') || type.includes('document')) return 'word';
    return 'file';
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDocumentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('CimiteroDocumenti')
        .delete()
        .eq('Id', id);

      if (error) throw error;
      
      setLocalDocumenti(prevDocs => prevDocs.filter(d => d.Id !== id));
      await queryClient.invalidateQueries({ queryKey: ['cimiteri'] });
      await onUploadComplete();
      
      if (onDelete) {
        onDelete();
      }
      toast.success("Documento eliminato con successo");
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Errore durante l'eliminazione del documento");
    }
  };

  const handleFileSelect = async (file: File) => {
    let toastId: string | number = '';
    try {
      setIsUploading(true);
      toastId = toast.loading("Caricamento in corso...");

      const fileExt = file.name.split('.').pop();
      const filePath = `${cimiteroId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('cemetery-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('cemetery-documents')
        .getPublicUrl(filePath);

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

      if (dbError) throw dbError;

      setLocalDocumenti(prevDocs => [...prevDocs, newDoc]);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['cimiteri'] }),
        onUploadComplete()
      ]);

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
                <File className="w-8 h-8 text-[var(--primary-color)]" />
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

      {/* Dialog di conferma eliminazione */}
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
