
import { WifiOff } from "lucide-react";

interface OfflineIndicatorProps {
  isOnline: boolean;
}

export const OfflineIndicator = ({ isOnline }: OfflineIndicatorProps) => {
  if (isOnline) return null;

  return (
    <div className="bg-amber-950/40 text-amber-200 py-1 px-4 flex items-center justify-center gap-1 border-b border-amber-800/30 animate-fade-in text-xs">
      <WifiOff className="h-3 w-3" />
      <span className="font-medium">Modalità offline attiva</span>
    </div>
  );
};
