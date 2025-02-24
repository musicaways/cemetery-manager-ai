
import { Image } from "lucide-react";
import { useState } from "react";
import { CimiteroFoto } from "../../../types";
import { MediaViewer } from "../components/MediaViewer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface GalleryTabProps {
  foto: CimiteroFoto[];
  onDelete?: () => void;
  canEdit?: boolean;
}

export const GalleryTab = ({ foto, onDelete, canEdit }: GalleryTabProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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
    } catch (error) {
      console.error("Error deleting photo:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center text-white">
        <Image className="w-5 h-5 mr-2 text-[var(--primary-color)]" />
        Galleria Foto
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {foto?.map((foto, index) => (
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
            {foto.Descrizione && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                <p className="text-white text-sm text-center">{foto.Descrizione}</p>
              </div>
            )}
          </div>
        ))}
      </div>

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
