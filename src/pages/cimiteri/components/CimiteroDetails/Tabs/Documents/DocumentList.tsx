
import { File, FileImage, FileText, FileSpreadsheet, Trash2 } from "lucide-react";
import { CimiteroDocumenti } from "../../../../types";

interface DocumentListProps {
  documenti: CimiteroDocumenti[];
  canEdit?: boolean;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onSelect: (index: number) => void;
}

const getFileIcon = (fileType: string) => {
  const type = fileType.toLowerCase();
  if (type.includes('image')) return <FileImage className="w-8 h-8 text-blue-400" />;
  if (type.includes('pdf')) return <FileText className="w-8 h-8 text-red-400" />;
  if (type.includes('excel') || type.includes('spreadsheet') || type.includes('sheet')) 
    return <FileSpreadsheet className="w-8 h-8 text-green-400" />;
  return <File className="w-8 h-8 text-[var(--primary-color)]" />;
};

export const DocumentList = ({ documenti, canEdit, onDelete, onSelect }: DocumentListProps) => {
  if (documenti.length === 0 && !canEdit) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nessun documento disponibile
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {documenti.map((documento, index) => (
        <div 
          key={documento.Id} 
          className="relative group p-4 rounded-lg border border-gray-800/50 hover:border-[var(--primary-color)] transition-all duration-300 cursor-pointer hover:scale-[0.98] bg-black/20"
          onClick={() => onSelect(index)}
        >
          <div className="flex items-center space-x-3">
            {getFileIcon(documento.TipoFile)}
            <div className="overflow-hidden flex-1">
              <p className="text-sm text-gray-200 truncate">{documento.NomeFile}</p>
              <p className="text-xs text-gray-500">{documento.TipoFile}</p>
            </div>
          </div>

          {canEdit && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => onDelete(documento.Id, e)}
                className="p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-full backdrop-blur-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
