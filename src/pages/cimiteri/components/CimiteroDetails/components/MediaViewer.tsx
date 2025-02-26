
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useEffect, useCallback } from "react";
import { MediaViewerControls } from "./MediaViewerControls";
import { MediaViewerNavigation } from "./MediaViewerNavigation";
import { MediaViewerDescription } from "./MediaViewerDescription";
import { MediaViewerContent } from "./MediaViewerContent";

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
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    if (items.length > 0 && currentIndex >= items.length) {
      setCurrentIndex(0);
    }
  }, [items, currentIndex]);

  useEffect(() => {
    if (initialIndex !== currentIndex) {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex]);

  const currentItem = items[currentIndex];
  
  const handlePrevious = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsImageLoading(true);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  }, [items.length]);

  const handleNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsImageLoading(true);
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  }, [items.length]);

  const handleDelete = useCallback(async () => {
    if (!onDelete || !currentItem) return;
    try {
      setIsDeleting(true);
      await onDelete(currentItem.Id);
      if (items.length <= 1) {
        onClose();
      } else {
        handleNext({ stopPropagation: () => {} } as React.MouseEvent);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [currentItem, items.length, onDelete, onClose, handleNext]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowLeft":
        handlePrevious({ stopPropagation: () => {} } as React.MouseEvent);
        break;
      case "ArrowRight":
        handleNext({ stopPropagation: () => {} } as React.MouseEvent);
        break;
      case "Escape":
        onClose();
        break;
      default:
        break;
    }
  }, [handlePrevious, handleNext, onClose]);

  if (!currentItem || !isOpen) return null;

  const isImage = currentItem.TipoFile?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(currentItem.Url);

  if (isImage) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent 
          className="max-w-[95vw] h-[95vh] p-0 bg-black/95 border-none"
          onKeyDown={handleKeyDown}
        >
          <MediaViewerNavigation
            showNavigation={items.length > 1}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />

          <MediaViewerControls
            onClose={onClose}
            onDelete={canDelete ? handleDelete : undefined}
            canDelete={canDelete}
            isDeleting={isDeleting}
          />

          <MediaViewerContent
            item={currentItem}
            isImage={true}
            isImageLoading={isImageLoading}
            onImageLoad={() => setIsImageLoading(false)}
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect width="18" height="18" x="3" y="3" rx="2" ry="2"%3E%3C/rect%3E%3Ccircle cx="9" cy="9" r="2"%3E%3C/circle%3E%3Cpath d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"%3E%3C/path%3E%3C/svg%3E';
              setIsImageLoading(false);
            }}
          />

          <MediaViewerDescription
            description={currentItem.Descrizione}
            currentIndex={currentIndex}
            totalItems={items.length}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-screen-lg p-6 bg-black/95"
        onKeyDown={handleKeyDown}
      >
        <MediaViewerControls
          onClose={onClose}
          onDelete={canDelete ? handleDelete : undefined}
          canDelete={canDelete}
          isDeleting={isDeleting}
        />
        
        <MediaViewerContent
          item={currentItem}
          isImage={false}
        />
      </DialogContent>
    </Dialog>
  );
};
