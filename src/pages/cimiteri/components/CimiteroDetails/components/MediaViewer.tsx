
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, ExternalLink, Download } from "lucide-react";
import { useState, useEffect, memo } from "react";
import { toast } from "sonner";

interface MediaViewerProps {
  items: Array<{ Id: string; Url: string; Descrizione?: string | null; TipoFile?: string }>;
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => Promise<void>;
  canDelete?: boolean;
}

// Memorizziamo il contenuto del viewer per evitare re-render non necessari
const ViewerContent = memo(({ url, type, onLoad, onError }: { 
  url: string;
  type?: string;
  onLoad: () => void;
  onError: () => void;
}) => {
  const isPDF = url?.toLowerCase().endsWith('.pdf');
  const isImage = type?.startsWith('image/') || url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  if (isPDF) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        <div className="flex gap-2 mb-4">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-white text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Apri in una nuova finestra
          </a>
          <a
            href={url}
            download
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-white text-sm"
          >
            <Download className="w-4 h-4" />
            Scarica PDF
          </a>
        </div>
        <iframe
          src={url}
          className="w-full h-full bg-white rounded-lg"
          onLoad={onLoad}
          onError={onError}
          title="PDF Viewer"
          sandbox="allow-same-origin allow-scripts allow-forms"
        />
      </div>
    );
  }

  if (isImage) {
    return (
      <img
        src={url}
        alt=""
        className="max-w-full max-h-full object-contain"
        onLoad={onLoad}
        onError={onError}
        loading="lazy"
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-white">Questo tipo di file non può essere visualizzato direttamente.</p>
      <div className="flex gap-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-white text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          Apri in una nuova finestra
        </a>
        <a
          href={url}
          download
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-white text-sm"
        >
          <Download className="w-4 h-4" />
          Scarica file
        </a>
      </div>
    </div>
  );
});

ViewerContent.displayName = "ViewerContent";

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const currentItem = items[currentIndex];

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(false);
    }
  }, [isOpen, currentIndex]);

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
        className="max-w-[95vw] h-[95vh] p-0 border-none bg-black/90 md:max-w-7xl overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        <DialogTitle className="sr-only">Visualizzatore Media</DialogTitle>
        
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
              className="absolute top-4 right-16 z-50 text-red-500 hover:bg-white/20"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <X className="h-6 w-6" />
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

          {/* Loading indicator */}
          {isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          )}

          {/* Main content */}
          <div className="w-full h-full flex items-center justify-center p-8">
            {currentItem && (
              <ViewerContent
                url={currentItem.Url}
                type={currentItem.TipoFile}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setError(true);
                  toast.error("Errore nel caricamento del file");
                }}
              />
            )}

            {error && (
              <div className="text-white text-center">
                <p>Impossibile caricare il file</p>
                <p className="text-sm text-gray-400 mb-4">Il file potrebbe non essere più disponibile</p>
                <div className="flex gap-2 justify-center">
                  <a
                    href={currentItem?.Url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-white text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Prova ad aprire in una nuova finestra
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {currentItem?.Descrizione && !isLoading && !error && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-center">{currentItem.Descrizione}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
