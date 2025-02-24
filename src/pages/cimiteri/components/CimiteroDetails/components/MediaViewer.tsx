
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MediaViewerProps {
  items: Array<{ Id: string; Url: string; Descrizione?: string | null }>;
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => Promise<void>;
  canDelete?: boolean;
}

export const MediaViewer = ({
  items,
  currentIndex: initialIndex,
  isOpen,
  onClose,
  onDelete,
  canDelete
}: MediaViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentItem = items[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  };

  const handleDelete = async () => {
    if (!onDelete || !currentItem) return;
    
    try {
      setIsDeleting(true);
      await onDelete(currentItem.Id);
      toast.success("File eliminato con successo");
      
      if (items.length === 1) {
        onClose();
      } else {
        handleNext();
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Errore durante l'eliminazione del file");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "Escape") onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[95vw] h-[95vh] p-0 border-none bg-black/90 md:max-w-7xl"
        onKeyDown={handleKeyDown}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Delete button */}
          {canDelete && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-16 z-50 text-white hover:bg-white/20"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-6 w-6 text-red-500" />
            </Button>
          )}

          {/* Navigation buttons */}
          {items.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 z-50 text-white hover:bg-white/20"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 z-50 text-white hover:bg-white/20"
                onClick={handleNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Main content */}
          <div className="w-full h-full flex items-center justify-center p-8">
            <img
              src={currentItem?.Url}
              alt={currentItem?.Descrizione || ""}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Description */}
          {currentItem?.Descrizione && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-center">{currentItem.Descrizione}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
