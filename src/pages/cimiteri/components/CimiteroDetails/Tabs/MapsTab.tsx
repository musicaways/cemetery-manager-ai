
import { MapPin } from "lucide-react";
import { useState } from "react";
import { CimiteroMappe } from "../../../types";
import { MediaViewer } from "../components/MediaViewer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MapsTabProps {
  mappe: CimiteroMappe[];
  onDelete?: () => void;
  canEdit?: boolean;
}

export const MapsTab = ({ mappe, onDelete, canEdit }: MapsTabProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('CimiteroMappe')
        .delete()
        .eq('Id', id);

      if (error) throw error;
      
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error("Error deleting map:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center text-white">
        <MapPin className="w-5 h-5 mr-2 text-[var(--primary-color)]" />
        Mappe
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mappe?.map((mappa, index) => (
          <div
            key={mappa.Id}
            className="block aspect-[4/3] relative group rounded-lg overflow-hidden border border-gray-800 hover:border-[var(--primary-color)] transition-colors cursor-pointer"
            onClick={() => setSelectedIndex(index)}
          >
            <img
              src={mappa.Url}
              alt={mappa.Descrizione || "Mappa cimitero"}
              className="w-full h-full object-cover"
            />
            {mappa.Descrizione && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                <p className="text-white text-sm text-center">{mappa.Descrizione}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <MediaViewer
        items={mappe}
        currentIndex={selectedIndex ?? 0}
        isOpen={selectedIndex !== null}
        onClose={() => setSelectedIndex(null)}
        onDelete={canEdit ? handleDelete : undefined}
        canDelete={canEdit}
      />
    </div>
  );
};
