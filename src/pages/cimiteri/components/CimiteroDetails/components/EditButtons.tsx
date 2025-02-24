
import { Button } from "@/components/ui/button";
import { Save, Edit2 } from "lucide-react";

interface EditButtonsProps {
  editMode: boolean;
  onEdit: () => void;
  onSave: () => void;
}

export const EditButtons = ({ editMode, onEdit, onSave }: EditButtonsProps) => {
  return (
    <div className="mt-auto">
      {editMode ? (
        <Button 
          onClick={onSave} 
          className="w-full h-11 bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90 shadow-lg"
        >
          <Save className="w-4 h-4 mr-2" />
          Salva modifiche
        </Button>
      ) : (
        <Button 
          onClick={onEdit} 
          className="w-full h-11 bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Modifica
        </Button>
      )}
    </div>
  );
};
