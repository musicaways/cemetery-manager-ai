
import { Image as ImageIcon, Trash2 } from "lucide-react";
import { CimiteroFoto } from "../../../../types";

interface PhotoGridProps {
  photos: CimiteroFoto[];
  onPhotoClick: (index: number) => void;
  onDeleteClick: (id: string, e: React.MouseEvent) => void;
  canEdit?: boolean;
}

export const PhotoGrid = ({
  photos,
  onPhotoClick,
  onDeleteClick,
  canEdit
}: PhotoGridProps) => {
  return (
    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
      {photos.map((foto, index) => (
        <div 
          key={foto.Id} 
          className="relative group aspect-square rounded-lg overflow-hidden border border-gray-800/50 hover:border-[var(--primary-color)] transition-all duration-300 cursor-pointer hover:scale-[0.98] bg-black/20"
          onClick={() => onPhotoClick(index)}
        >
          <img
            src={foto.Url}
            alt={foto.Descrizione || "Foto cimitero"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {canEdit && (
              <button
                onClick={(e) => onDeleteClick(foto.Id, e)}
                className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full backdrop-blur-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="absolute bottom-1 right-1 bg-black/50 backdrop-blur-sm p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ImageIcon className="w-3 h-3 text-white" />
          </div>
        </div>
      ))}
    </div>
  );
};
