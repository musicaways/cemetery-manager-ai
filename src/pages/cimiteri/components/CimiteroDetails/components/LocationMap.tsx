
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Navigation, Maximize } from 'lucide-react';
import { FullscreenMap } from './FullscreenMap';

interface LocationMapProps {
  latitude: number;
  longitude: number;
}

export const LocationMap = ({ latitude, longitude }: LocationMapProps) => {
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleOpenInMaps = () => {
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

  const handleOpenGoogleMaps = () => {
    window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-gray-800">
        <iframe
          className="w-full h-full"
          style={{ border: 0 }}
          src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyD9I5JVW_vnECzvENv6HFg8CXwKX-exnXs&q=${latitude},${longitude}&zoom=18&maptype=satellite&language=it&region=IT&gestureHandling=greedy`}
          loading="lazy"
          allowFullScreen
        />
      </div>
      <div className="flex flex-col gap-2">
        {isMobile && (
          <Button
            variant="default"
            className="w-full bg-[var(--primary-color)] hover:bg-[var(--primary-hover)]"
            onClick={handleOpenInMaps}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Avvia Navigazione
          </Button>
        )}
        <Button
          variant="default"
          className="w-full bg-[var(--primary-color)] hover:bg-[var(--primary-hover)]"
          onClick={handleOpenGoogleMaps}
        >
          <Navigation className="h-4 w-4 mr-2" />
          Apri in Google Maps
        </Button>
        <Button
          variant="default"
          className="w-full bg-[var(--primary-color)] hover:bg-[var(--primary-hover)]"
          onClick={() => setIsFullscreenOpen(true)}
        >
          <Maximize className="h-4 w-4 mr-2" />
          Apri Mappa Grande
        </Button>
      </div>

      <FullscreenMap 
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        latitude={latitude}
        longitude={longitude}
      />
    </div>
  );
};
