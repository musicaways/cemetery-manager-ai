
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Image, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface MediaUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
}

export const MediaUpload = ({ isOpen, onClose, onUpload }: MediaUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (file: File) => {
    try {
      if (!file.type.startsWith('image/')) {
        toast.error('Per favore carica solo immagini');
        return;
      }
      onUpload(file);
    } catch (error) {
      console.error('Errore upload:', error);
      toast.error('Errore durante il caricamento del file');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A1F2C] border-gray-800 text-gray-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Carica immagine</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant="outline"
            className="flex flex-col items-center p-6 h-auto space-y-2 bg-gray-800/50 border-gray-700 hover:bg-gray-700/50"
            onClick={() => document.getElementById('camera')?.click()}
          >
            <Camera className="h-8 w-8 text-blue-400" />
            <span>Camera</span>
            <input
              id="camera"
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center p-6 h-auto space-y-2 bg-gray-800/50 border-gray-700 hover:bg-gray-700/50"
            onClick={() => document.getElementById('gallery')?.click()}
          >
            <Image className="h-8 w-8 text-purple-400" />
            <span>Galleria</span>
            <input
              id="gallery"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
