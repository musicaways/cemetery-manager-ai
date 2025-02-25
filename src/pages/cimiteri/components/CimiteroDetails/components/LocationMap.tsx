
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Navigation } from 'lucide-react';

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
    <div className="space-y-4">
      <div className="w-full aspect-[4/3] rounded-lg overflow-hidden border border-gray-800">
        <iframe
          ref={mapContainer}
          className="absolute inset-0 w-full h-full"
          src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyD9I5JVW_vnECzvENv6HFg8CXwKX-exnXs&q=${latitude},${longitude}&zoom=18&maptype=satellite&language=it&region=IT&disableDefaultUI=true`}
          allowFullScreen
        />
      </div>
      <Button
        variant="default"
        className="w-full bg-[var(--primary-color)] hover:bg-[var(--primary-hover)]"
        onClick={handleOpenInMaps}
      >
        <Navigation className="h-4 w-4 mr-2" />
        Avvia Navigazione
      </Button>
    </div>
  );
};
