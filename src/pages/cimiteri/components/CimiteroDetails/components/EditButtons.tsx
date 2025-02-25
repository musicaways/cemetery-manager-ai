
import { Button } from "@/components/ui/button";
import { Save, Edit2 } from "lucide-react";

interface EditButtonsProps {
  editMode: boolean;
  onEdit: () => void;
  onSave: () => void;
}

export const EditButtons = ({ editMode, onEdit, onSave }: EditButtonsProps) => {
  return (
    <>
      {editMode ? (
        <Button 
          onClick={onSave} 
          size="icon"
          className="h-10 w-10 rounded-full bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90 shadow-lg"
        >
          <Save className="w-4 h-4" />
        </Button>
      ) : (
        <Button 
          onClick={onEdit} 
          size="icon"
          className="h-10 w-10 rounded-full bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
        >
          <Edit2 className="w-4 h-4" />
        </Button>
      )}
    </>
  );
};
