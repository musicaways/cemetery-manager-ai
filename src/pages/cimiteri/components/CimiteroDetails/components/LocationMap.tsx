
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Globe } from 'lucide-react';

interface LocationMapProps {
  latitude: number;
  longitude: number;
}

export const LocationMap = ({ latitude, longitude }: LocationMapProps) => {
  const mapContainer = useRef<HTMLIFrameElement>(null);

  const handleOpenInMaps = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, '_blank');
  };

  return (
    <div className="relative w-full aspect-[21/9] rounded-lg overflow-hidden border border-gray-800">
      <iframe
        ref={mapContainer}
        className="absolute inset-0 w-full h-full"
        src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyB_x50Ua4TtkSHYG9cRGR7kQkaVf-KLi1g&center=${latitude},${longitude}&zoom=18&maptype=satellite`}
        allowFullScreen
      />
      <Button
        variant="outline"
        size="sm"
        className="absolute top-4 right-4 z-10 bg-black/60 border-gray-600 hover:bg-black/80 text-white"
        onClick={handleOpenInMaps}
      >
        <Globe className="h-4 w-4 mr-2" />
        Visualizza in Google Maps
      </Button>
    </div>
  );
};
