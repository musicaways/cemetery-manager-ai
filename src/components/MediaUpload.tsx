
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Image, FileText, Mic, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MediaUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (url: string) => void;
}

export const MediaUpload = ({ isOpen, onClose, onUpload }: MediaUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      onUpload(publicUrl);
      onClose();
      toast.success('File caricato con successo');
    } catch (error) {
      console.error('Errore upload:', error);
      toast.error('Errore durante il caricamento del file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] border-gray-800 text-gray-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Aggiungi contenuto</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4 py-4">
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
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
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
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center p-6 h-auto space-y-2 bg-gray-800/50 border-gray-700 hover:bg-gray-700/50"
            onClick={() => document.getElementById('file')?.click()}
          >
            <FileText className="h-8 w-8 text-green-400" />
            <span>File</span>
            <input
              id="file"
              type="file"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
