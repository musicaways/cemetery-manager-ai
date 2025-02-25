
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

interface LocationMapProps {
  latitude: number;
  longitude: number;
}

export const LocationMap = ({ latitude, longitude }: LocationMapProps) => {
  const mapContainer = useRef<HTMLIFrameElement>(null);

  const handleOpenInMaps = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Per iOS
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.location.href = `maps://maps.apple.com/?q=${latitude},${longitude}`;
      } 
      // Per Android
      else if (/Android/i.test(navigator.userAgent)) {
        window.location.href = `google.navigation:q=${latitude},${longitude}`;
      }
    } else {
      // Per desktop
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
    }
  };

  return (
    <div className="relative w-full aspect-[21/9] rounded-lg overflow-hidden border border-gray-800">
      <iframe
        ref={mapContainer}
        className="absolute inset-0 w-full h-full"
        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyD9I5JVW_vnECzvENv6HFg8CXwKX-exnXs&q=${latitude},${longitude}&zoom=18&maptype=satellite`}
        allowFullScreen
      />
      <Button
        variant="outline"
        size="sm"
        className="absolute bottom-4 right-4 z-10 bg-black/60 border-gray-600 hover:bg-black/80 text-white"
        onClick={handleOpenInMaps}
      >
        <Globe className="h-4 w-4 mr-2" />
        Naviga su Google Maps
      </Button>
    </div>
  );
};
