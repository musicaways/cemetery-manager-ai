
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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

  const getFileIcon = () => {
    if (currentItem.TipoFile?.includes('pdf') || currentItem.Url?.toLowerCase().endsWith('.pdf')) {
      return '📄';
    }
    if (currentItem.TipoFile?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(currentItem.Url)) {
      return '🖼️';
    }
    return '📎';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-screen-lg p-6 bg-black/95"
        onKeyDown={handleKeyDown}
      >
        <DialogTitle className="text-white mb-4 flex items-center gap-2">
          {getFileIcon()} {currentItem.Descrizione || 'File'}
        </DialogTitle>
        
        <div className="relative w-full flex flex-col items-center justify-center gap-6">
          {/* Anteprima */}
          {currentItem.TipoFile?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(currentItem.Url) ? (
            <div className="w-24 h-24 bg-white/10 rounded-lg overflow-hidden">
              <img
                src={currentItem.Url}
                alt={currentItem.Descrizione || ''}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-24 h-24 bg-white/10 rounded-lg flex items-center justify-center text-4xl">
              {getFileIcon()}
            </div>
          )}

          {/* Azioni */}
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

          {/* Navigazione */}
          {items.length > 1 && (
            <div className="flex items-center gap-4 mt-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <span className="text-white text-sm">
                {currentIndex + 1} di {items.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          )}
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
