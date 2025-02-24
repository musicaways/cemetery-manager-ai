
import { File } from "lucide-react";
import { useState } from "react";
import { CimiteroDocumenti } from "../../../types";
import { MediaViewer } from "../components/MediaViewer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DocumentsTabProps {
  documenti: CimiteroDocumenti[];
  onDelete?: () => void;
  canEdit?: boolean;
}

export const DocumentsTab = ({ documenti, onDelete, canEdit }: DocumentsTabProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('CimiteroDocumenti')
        .delete()
        .eq('Id', id);

      if (error) throw error;
      
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center text-white">
        <File className="w-5 h-5 mr-2 text-[var(--primary-color)]" />
        Documenti
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {documenti?.map((doc, index) => (
          <div
            key={doc.Id}
            className="relative group rounded-lg overflow-hidden border border-gray-800 hover:border-[var(--primary-color)] transition-colors cursor-pointer p-4"
            onClick={() => setSelectedIndex(index)}
          >
            <div className="flex items-center space-x-3">
              <File className="w-8 h-8 text-[var(--primary-color)]" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {doc.NomeFile}
                </p>
                {doc.Descrizione && (
                  <p className="text-xs text-gray-400 truncate">
                    {doc.Descrizione}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <MediaViewer
        items={documenti}
        currentIndex={selectedIndex ?? 0}
        isOpen={selectedIndex !== null}
        onClose={() => setSelectedIndex(null)}
        onDelete={canEdit ? handleDelete : undefined}
        canDelete={canEdit}
      />
    </div>
  );
};
