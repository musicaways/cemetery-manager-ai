
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface OfflineIndicatorProps {
  isOnline: boolean;
}

export const OfflineIndicator = ({ isOnline }: OfflineIndicatorProps) => {
  if (isOnline) return null; // Non mostrare nulla se siamo online
  
  return (
    <div className={cn(
      "fixed top-16 left-0 right-0 p-2 z-50 flex items-center justify-center",
      "bg-amber-600/90 text-white text-sm shadow-md backdrop-blur-sm"
    )}>
      <WifiOff className="h-4 w-4 mr-2" />
      <span>Modalità offline - Alcune funzionalità potrebbero essere limitate</span>
    </div>
  );
};
