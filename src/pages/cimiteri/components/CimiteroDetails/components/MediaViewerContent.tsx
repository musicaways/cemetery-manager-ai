
import { DownloadViewer } from "./viewers/DownloadViewer";
import { ImageViewer } from "./viewers/ImageViewer";
import { PDFViewer } from "./viewers/PDFViewer";

interface MediaViewerContentProps {
  currentItem: { 
    Url: string; 
    Descrizione?: string | null; 
    TipoFile?: string 
  } | undefined;
}

export const MediaViewerContent = ({ currentItem }: MediaViewerContentProps) => {
  if (!currentItem) return null;

  const fileType = currentItem.TipoFile || '';
  const fileExtension = currentItem.Url?.split('.').pop()?.toLowerCase() || '';

  const isPDF = fileExtension === 'pdf' || fileType.includes('pdf');
  const isImage = fileType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(fileExtension);

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      {isPDF ? (
        <PDFViewer url={currentItem.Url} />
      ) : isImage ? (
        <ImageViewer 
          url={currentItem.Url} 
          alt={currentItem.Descrizione || ''} 
        />
      ) : (
        <DownloadViewer 
          url={currentItem.Url} 
          filename={currentItem.Descrizione || 'file'} 
        />
      )}
    </div>
  );
};
