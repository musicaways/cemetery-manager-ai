
import { useState } from 'react';

interface ImageViewerProps {
  url: string;
  alt: string;
}

export const ImageViewer = ({ url, alt }: ImageViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="text-white text-center">
        <p>Impossibile caricare l'immagine</p>
        <p className="text-sm text-gray-400">L'immagine potrebbe non essere più disponibile</p>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
      <img
        src={url}
        alt={alt}
        className="max-w-full max-h-[80vh] object-contain"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setError(true);
        }}
        loading="lazy"
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </>
  );
};
