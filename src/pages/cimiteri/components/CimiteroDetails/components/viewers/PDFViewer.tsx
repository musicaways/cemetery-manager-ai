
import { ExternalLink, Download } from 'lucide-react';

interface PDFViewerProps {
  url: string;
}

export const PDFViewer = ({ url }: PDFViewerProps) => {
  return (
    <div className="w-full h-full flex flex-col items-center gap-4 p-4">
      <div className="flex gap-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-white text-sm"
        >
          <ExternalLink className="w-4 h-4" />
          Apri PDF in una nuova finestra
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
      <div className="w-full h-[calc(100%-4rem)] bg-white/5 rounded-lg flex items-center justify-center text-white/60 text-sm">
        Clicca uno dei pulsanti sopra per visualizzare o scaricare il PDF
      </div>
    </div>
  );
};
