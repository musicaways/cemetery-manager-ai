
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface LocationMapProps {
  latitude: number;
  longitude: number;
}

export const LocationMap = ({ latitude, longitude }: LocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Token pubblico di Mapbox (questo è un token di esempio, dovresti usare il tuo)
    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHQ2azlsb3QwMnF2MmltbGR6OHBkdWd2In0.O2m7VLbwzVktWWyEeUl_mQ';
    
    // Inizializzazione mappa
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [longitude, latitude],
      zoom: 15,
      pitch: 45,
    });

    // Aggiungi controlli di navigazione
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'bottom-right'
    );

    // Aggiungi marker
    marker.current = new mapboxgl.Marker({
      color: '#10b981',
    })
      .setLngLat([longitude, latitude])
      .addTo(map.current);

    // Effetti atmosferici
    map.current.on('style.load', () => {
      map.current?.setFog({
        color: 'rgb(186, 210, 235)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.02
      });
    });

    return () => {
      if (marker.current) {
        marker.current.remove();
      }
      if (map.current) {
        map.current.remove();
      }
    };
  }, [latitude, longitude]);

  const handleOpenInMaps = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, '_blank');
  };

  return (
    <div className="relative w-full aspect-[21/9] rounded-lg overflow-hidden border border-gray-800">
      <div ref={mapContainer} className="absolute inset-0" />
      <Button
        variant="outline"
        size="sm"
        className="absolute top-4 right-4 z-10 bg-black/50 border-gray-600 hover:bg-black/70"
        onClick={handleOpenInMaps}
      >
        <ExternalLink className="h-4 w-4 mr-2" />
        Apri in Google Maps
      </Button>
    </div>
  );
};
