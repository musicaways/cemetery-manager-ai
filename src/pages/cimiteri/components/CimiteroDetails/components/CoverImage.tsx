
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";

interface CoverImageProps {
  imageUrl?: string | null;
  description: string;
  editMode: boolean;
  onUpload: () => void;
  selectedFile?: File | null;
}

export const CoverImage = ({
  imageUrl,
  description,
  editMode,
  onUpload,
  selectedFile,
}: CoverImageProps) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!editMode) return;

      const file = e.dataTransfer.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        toast.error('Per favore carica solo immagini');
        return;
      }

      onUpload();
    },
    [editMode, onUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  return (
    <div 
      className={`relative h-[300px] overflow-hidden group ${editMode && !imageUrl ? 'cursor-pointer' : ''}`}
      onClick={() => {
        if (editMode && !imageUrl) {
          onUpload();
        }
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {(selectedFile || imageUrl) ? (
        <>
          <img
            src={selectedFile ? URL.createObjectURL(selectedFile) : imageUrl!}
            alt={description || "Foto cimitero"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1F2C] via-transparent to-transparent" />
        </>
      ) : (
        <div className={`w-full h-full flex flex-col items-center justify-center ${editMode ? 'bg-black/40 hover:bg-black/50' : 'bg-black/20'} transition-colors`}>
          <ImagePlus className="w-12 h-12 text-white mb-2" />
          {editMode && (
            <p className="text-white text-sm">
              Clicca o trascina un'immagine qui per caricarla
            </p>
          )}
        </div>
      )}
      
      {editMode && (imageUrl || selectedFile) && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onUpload();
          }}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white text-black hover:text-black"
        >
          <ImagePlus className="w-4 h-4 mr-2" />
          Cambia foto
        </Button>
      )}
    </div>
  );
};
