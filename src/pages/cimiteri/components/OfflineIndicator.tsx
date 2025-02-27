
import { WifiOff } from 'lucide-react';

interface OfflineIndicatorProps {
  isOnline: boolean;
}

export const OfflineIndicator = ({ isOnline }: OfflineIndicatorProps) => {
  if (isOnline) return null;

  return (
    <div className="bg-amber-600/90 text-white p-2 flex items-center justify-center">
      <WifiOff className="h-4 w-4 mr-2" />
      <span>Modalità offline attiva - Alcune funzionalità potrebbero non essere disponibili</span>
    </div>
  );
};
