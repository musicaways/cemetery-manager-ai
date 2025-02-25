
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface FullscreenMapProps {
  isOpen: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
}

export const FullscreenMap = ({ isOpen, onClose, latitude, longitude }: FullscreenMapProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full h-[100vh] p-0 bg-[#1A1F2C]">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 z-50 rounded-full bg-black/40 p-2 hover:bg-black/60 transition-colors"
        >
          <X className="h-5 w-5 text-white" />
        </button>
        <iframe
          className="w-full h-full"
          style={{ border: 0 }}
          src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyD9I5JVW_vnECzvENv6HFg8CXwKX-exnXs&q=${latitude},${longitude}&zoom=18&maptype=satellite&language=it&region=IT`}
          loading="lazy"
          allowFullScreen
        />
      </DialogContent>
    </Dialog>
  );
};
