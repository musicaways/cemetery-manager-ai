
import { WifiOff } from "lucide-react";

interface OfflineIndicatorProps {
  isOnline: boolean;
}

export const OfflineIndicator = ({ isOnline }: OfflineIndicatorProps) => {
  if (isOnline) return null;

  return (
    <div className="bg-amber-950/60 text-amber-200 py-2 px-4 flex items-center justify-center gap-2 border-b border-amber-800/50 animate-fade-in">
      <WifiOff className="h-4 w-4" />
      <span className="text-sm font-medium">Modalità offline - Funzionalità limitate</span>
    </div>
  );
};
