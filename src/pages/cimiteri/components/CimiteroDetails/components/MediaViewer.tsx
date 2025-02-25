
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState, useEffect } from "react";
import { MediaViewerControls } from "./MediaViewerControls";
import { MediaViewerNavigation } from "./MediaViewerNavigation";
import { MediaViewerContent } from "./MediaViewerContent";
import { MediaViewerDescription } from "./MediaViewerDescription";

interface MediaViewerProps {
  items: Array<{ Id: string; Url: string; Descrizione?: string | null; TipoFile?: string }>;
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

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

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
      if (items.length === 1) {
        onClose();
      } else {
        handleNext();
      }
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
        className="max-w-screen-lg h-[90vh] p-0 border-none bg-black/95 overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        <DialogTitle className="sr-only">Visualizzatore Media</DialogTitle>
        
        <div className="relative w-full h-full flex items-center justify-center">
          <MediaViewerControls 
            onClose={onClose}
            onDelete={handleDelete}
            canDelete={canDelete}
            isDeleting={isDeleting}
          />

          <MediaViewerNavigation 
            showNavigation={items.length > 1}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />

          <MediaViewerContent currentItem={currentItem} />

          <MediaViewerDescription description={currentItem?.Descrizione} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
