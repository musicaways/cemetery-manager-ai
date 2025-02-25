
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
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

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "Escape") onClose();
  }, [handlePrevious, handleNext, onClose]);

  if (!currentItem) return null;
  
  const isPDF = currentItem.Url?.toLowerCase().endsWith('.pdf') || currentItem.TipoFile?.includes('pdf');
  const isImage = currentItem.TipoFile?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(currentItem.Url);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-screen-lg h-[90vh] p-0 border-none bg-black/95"
        onKeyDown={handleKeyDown}
      >
        <DialogTitle className="sr-only">Visualizzatore Media</DialogTitle>
        <DialogDescription className="sr-only">
          Visualizzatore di immagini, PDF e altri file
        </DialogDescription>
        
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Controlli */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
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
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Navigazione */}
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

          {/* Contenuto */}
          <div className="w-full h-full flex items-center justify-center p-4">
            {isPDF ? (
              <div className="w-full h-full">
                <a 
                  href={currentItem.Url}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-white text-sm"
                >
                  Apri PDF in una nuova finestra
                </a>
              </div>
            ) : isImage ? (
              <img
                src={currentItem.Url}
                alt={currentItem.Descrizione || ''}
                className="max-w-full max-h-[80vh] object-contain"
                loading="eager"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="text-center">
                <p className="text-white mb-4">Questo file non può essere visualizzato direttamente</p>
                <a
                  href={currentItem.Url}
                  download
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-white text-sm"
                >
                  Scarica file
                </a>
              </div>
            )}
          </div>

          {/* Descrizione */}
          {currentItem.Descrizione && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-center">{currentItem.Descrizione}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
