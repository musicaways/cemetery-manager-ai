
import { ExternalLink, Download } from 'lucide-react';

interface DownloadViewerProps {
  url: string;
  filename: string;
}

export const DownloadViewer = ({ url, filename }: DownloadViewerProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-white text-center">
        Questo tipo di file non può essere visualizzato direttamente.
      </p>
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
          download={filename}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-white text-sm"
        >
          <Download className="w-4 h-4" />
          Scarica file
        </a>
      </div>
    </div>
  );
};
