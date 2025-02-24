
import { FileText } from "lucide-react";
import { CimiteroDocumenti } from "../../../types";

interface DocumentsTabProps {
  documenti: CimiteroDocumenti[];
}

export const DocumentsTab = ({ documenti }: DocumentsTabProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center text-white">
        <FileText className="w-5 h-5 mr-2 text-[var(--primary-color)]" />
        Documenti
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documenti?.map((doc) => (
          <a
            key={doc.Id}
            href={doc.Url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-4 bg-black/20 rounded-lg hover:bg-black/30 transition-colors border border-gray-800 hover:border-[var(--primary-color)]"
          >
            <FileText className="w-8 h-8 text-[var(--primary-color)] mr-3" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white line-clamp-1">{doc.NomeFile}</p>
              {doc.Descrizione && (
                <p className="text-sm text-gray-400 line-clamp-1">{doc.Descrizione}</p>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
