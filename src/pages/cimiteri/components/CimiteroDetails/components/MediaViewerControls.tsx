
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface MediaViewerControlsProps {
  onClose: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
  isDeleting?: boolean;
}

export const MediaViewerControls = ({ 
  onClose, 
  onDelete, 
  canDelete, 
  isDeleting 
}: MediaViewerControlsProps) => {
  return (
    <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
      {canDelete && onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="text-red-500 hover:bg-white/20"
          onClick={onDelete}
          disabled={isDeleting}
        >
          <X className="h-6 w-6" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white/20"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>
    </div>
  );
};
