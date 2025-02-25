
import { Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
}

export const FileUploadZone = ({ onFileSelect, accept = "image/*", maxSize = 5, disabled = false }: FileUploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): boolean => {
    // Verifica il tipo di file
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const isValidType = acceptedTypes.some(type => {
      if (type.includes('/*')) {
        const mainType = type.split('/')[0];
        return file.type.startsWith(mainType);
      }
      const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      return type.includes(extension);
    });

    if (!isValidType) {
      toast.error(`Tipo di file non supportato. Tipi supportati: ${accept}`);
      return false;
    }

    // Verifica la dimensione del file
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSize) {
      toast.error(`Il file è troppo grande. Dimensione massima: ${maxSize}MB`);
      return false;
    }

    return true;
  };

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
    try {
      if (!file) {
        toast.error("Nessun file selezionato");
        return;
      }

      if (!validateFile(file)) {
        return;
      }

      onFileSelect(file);
    } catch (error) {
      console.error("Errore nella gestione del file:", error);
      toast.error("Si è verificato un errore durante la gestione del file");
    }
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
          Dimensione massima: {maxSize}MB
        </p>
      </div>
    </div>
  );
};
