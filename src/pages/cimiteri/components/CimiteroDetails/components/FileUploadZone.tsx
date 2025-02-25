
import { Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
}

export const FileUploadZone = ({ onFileSelect, accept = "image/*", maxSize = 5, disabled = false }: FileUploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.match(accept.replace("*", ".*"))) {
      toast.error("Formato file non supportato");
      return;
    }

    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Il file non può superare ${maxSize}MB`);
      return;
    }

    onFileSelect(file);
  };

  return (
    <div
      className={`relative p-8 border-2 border-dashed rounded-lg transition-colors ${
        disabled 
          ? 'border-gray-600 bg-gray-800/20 cursor-not-allowed' 
          : isDragging 
            ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/10' 
            : 'border-gray-700 hover:border-gray-600'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        disabled={disabled}
      />
      <div className="flex flex-col items-center justify-center text-center space-y-2">
        <Upload className={`w-8 h-8 ${disabled ? 'text-gray-600' : 'text-gray-400'}`} />
        <p className={`text-sm ${disabled ? 'text-gray-600' : 'text-gray-400'}`}>
          {disabled ? 'Caricamento in corso...' : 'Trascina un file o clicca per selezionarlo'}
        </p>
        <p className={`text-xs ${disabled ? 'text-gray-600' : 'text-gray-500'}`}>
          Max {maxSize}MB
        </p>
      </div>
    </div>
  );
};
