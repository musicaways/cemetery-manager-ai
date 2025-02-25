
import { Image as ImageIcon } from "lucide-react";  // Rinominiamo l'importazione per evitare conflitti
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

  const compressImage = async (file: File, maxSizeMB: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = document.createElement('img');
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Mantieni l'aspect ratio riducendo le dimensioni se necessario
          const MAX_DIMENSION = 2048;
          if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            if (width > height) {
              height = Math.round((height * MAX_DIMENSION) / width);
              width = MAX_DIMENSION;
            } else {
              width = Math.round((width * MAX_DIMENSION) / height);
              height = MAX_DIMENSION;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Inizia con qualità alta e riduci gradualmente finché non raggiungi la dimensione target
          let quality = 0.9;
          let iteration = 0;
          const maxIterations = 10;
          
          const compress = () => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Failed to compress image'));
                  return;
                }
                
                // Se il file è ancora troppo grande e non abbiamo raggiunto il massimo di iterazioni,
                // riduci ulteriormente la qualità
                if (blob.size > maxSizeMB * 1024 * 1024 && iteration < maxIterations) {
                  quality = Math.max(0.1, quality - 0.1);
                  iteration++;
                  compress();
                } else {
                  resolve(blob);
                }
              },
              file.type,
              quality
            );
          };
          
          compress();
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
    });
  };

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
      const loadingToast = toast.loading("Elaborazione immagine in corso...");

      // Comprimi l'immagine se è più grande di 5MB
      let fileToUpload: File | Blob = file;
      if (file.size > 5 * 1024 * 1024) {
        const compressedBlob = await compressImage(file, 5);
        fileToUpload = compressedBlob;
        
        // Log della compressione
        const compressionRatio = ((file.size - compressedBlob.size) / file.size * 100).toFixed(1);
        console.log(`Immagine compressa: ${compressionRatio}% di riduzione`);
        
        toast.dismiss(loadingToast);
        toast.loading("Caricamento in corso...");
      }

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${cimiteroId}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('cemetery-photos')
        .upload(filePath, fileToUpload);

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
                <ImageIcon className="w-3 h-3 text-white" />
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
