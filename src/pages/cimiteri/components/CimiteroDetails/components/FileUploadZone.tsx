
import { Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
}

export const FileUploadZone = ({ onFileSelect, accept = "image/*", maxSize = 5 }: FileUploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      className={`relative p-8 border-2 border-dashed rounded-lg transition-colors
        ${isDragging 
          ? "border-[var(--primary-color)] bg-[var(--primary-color)]/10" 
          : "border-gray-700 hover:border-gray-600"
        }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center justify-center text-center space-y-2">
        <Upload className="w-8 h-8 text-gray-400" />
        <p className="text-sm text-gray-400">
          Trascina un file o clicca per selezionarlo
        </p>
        <p className="text-xs text-gray-500">
          Max {maxSize}MB
        </p>
      </div>
    </div>
  );
};
