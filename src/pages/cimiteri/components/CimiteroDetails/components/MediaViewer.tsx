
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, ExternalLink, Download } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

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

  // Reset currentIndex when items change
  useEffect(() => {
    if (items.length > 0 && currentIndex >= items.length) {
      setCurrentIndex(0);
    }
  }, [items, currentIndex]);

  // Sync with external currentIndex
  useEffect(() => {
    if (initialIndex !== currentIndex) {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex]);

  const currentItem = items[currentIndex];
  
  const handlePrevious = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Previene la propagazione dell'evento
    setIsImageLoading(true);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  }, [items.length]);

  const handleNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Previene la propagazione dell'evento
    setIsImageLoading(true);
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  }, [items.length]);

  const handleDelete = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation(); // Previene la propagazione dell'evento
    if (!onDelete || !currentItem) return;
    try {
      setIsDeleting(true);
      await onDelete(currentItem.Id);
      if (items.length <= 1) {
        onClose();
      } else {
        handleNext(e);
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
        handlePrevious(e as unknown as React.MouseEvent);
        break;
      case "ArrowRight":
        handleNext(e as unknown as React.MouseEvent);
        break;
      case "Escape":
        onClose();
        break;
      default:
        break;
    }
  }, [handlePrevious, handleNext, onClose]);

  const handleCloseClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Previene la propagazione dell'evento
    onClose();
  }, [onClose]);

  // Safety check
  if (!currentItem || !isOpen) return null;

  const isImage = currentItem.TipoFile?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(currentItem.Url);

  if (isImage) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent 
          className="max-w-[95vw] h-[95vh] p-0 bg-black/95 border-none"
          onKeyDown={handleKeyDown}
        >
          {/* Navigazione immagini */}
          <div className="absolute inset-0 flex items-center justify-between z-10 pointer-events-none">
            <div className="w-16 flex justify-start pointer-events-auto">
              {items.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
              )}
            </div>
            <div className="w-16 flex justify-end pointer-events-auto">
              {items.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              )}
            </div>
          </div>

          {/* Controlli superiori */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
            {canDelete && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:bg-white/20"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <X className="h-6 w-6" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={handleCloseClick}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Immagine */}
          <div className="w-full h-full flex items-center justify-center p-4">
            <img
              src={currentItem.Url}
              alt={currentItem.Descrizione || ''}
              className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => setIsImageLoading(false)}
              onClick={(e) => e.stopPropagation()} // Previene la propagazione dell'evento di click dell'immagine
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3E%3Crect width="18" height="18" x="3" y="3" rx="2" ry="2"%3E%3C/rect%3E%3Ccircle cx="9" cy="9" r="2"%3E%3C/circle%3E%3Cpath d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"%3E%3C/path%3E%3C/svg%3E';
                setIsImageLoading(false);
              }}
            />
          </div>

          {/* Didascalia */}
          {currentItem.Descrizione && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-center">{currentItem.Descrizione}</p>
              {items.length > 1 && (
                <p className="text-white/60 text-sm text-center mt-1">
                  {currentIndex + 1} di {items.length}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  // Rendering per file non immagine
  const fileIcon = currentItem.TipoFile?.includes('pdf') || currentItem.Url.toLowerCase().endsWith('.pdf')
    ? '📄'
    : '📎';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-screen-lg p-6 bg-black/95"
        onKeyDown={handleKeyDown}
      >
        <DialogTitle className="text-white mb-4 flex items-center gap-2">
          {fileIcon} {currentItem.Descrizione || 'File'}
        </DialogTitle>
        
        <div className="relative w-full flex flex-col items-center justify-center gap-6">
          {/* Preview */}
          <div className="w-24 h-24 bg-white/10 rounded-lg overflow-hidden flex items-center justify-center">
            <span className="text-4xl">{fileIcon}</span>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 w-full max-w-sm">
            <a
              href={currentItem.Url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-md text-white text-sm transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              Apri con app predefinita
            </a>
            
            <a
              href={currentItem.Url}
              download
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-md text-white text-sm transition-colors"
            >
              <Download className="w-5 h-5" />
              Scarica file
            </a>

            {canDelete && onDelete && (
              <Button
                variant="ghost"
                className="w-full text-red-500 hover:text-red-400 hover:bg-red-500/10"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <X className="w-5 h-5 mr-2" />
                Elimina file
              </Button>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </DialogContent>
    </Dialog>
  );
};
