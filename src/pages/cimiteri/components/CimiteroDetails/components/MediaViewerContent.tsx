
import { Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaItem {
  Id: string;
  Url: string;
  Descrizione?: string | null;
  TipoFile?: string;
}

interface MediaViewerContentProps {
  item: MediaItem;
  isImage: boolean;
  isImageLoading?: boolean;
  onImageLoad?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export const MediaViewerContent = ({
  item,
  isImage,
  isImageLoading,
  onImageLoad,
  onError
}: MediaViewerContentProps) => {
  if (isImage) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <img
          src={item.Url}
          alt={item.Descrizione || ''}
          className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
            isImageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={onImageLoad}
          onClick={(e) => e.stopPropagation()}
          onError={onError}
        />
      </div>
    );
  }

  const fileIcon = item.TipoFile?.includes('pdf') || item.Url.toLowerCase().endsWith('.pdf')
    ? '📄'
    : '📎';

  return (
    <div className="relative w-full flex flex-col items-center justify-center gap-6">
      <div className="w-24 h-24 bg-white/10 rounded-lg overflow-hidden flex items-center justify-center">
        <span className="text-4xl">{fileIcon}</span>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <a
          href={item.Url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-md text-white text-sm transition-colors"
        >
          <ExternalLink className="w-5 h-5" />
          Apri con app predefinita
        </a>
        
        <a
          href={item.Url}
          download
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-md text-white text-sm transition-colors"
        >
          <Download className="w-5 h-5" />
          Scarica file
        </a>
      </div>
    </div>
  );
};
