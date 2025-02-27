
import { AlertCircle, Wifi, WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/chat/useOnlineStatus";

export const OfflineIndicator = () => {
  const { isOnline } = useOnlineStatus();
  
  if (isOnline) {
    return (
      <div className="hidden sm:flex items-center gap-2 bg-green-500/20 text-green-400 text-xs px-3 py-1.5 rounded-full">
        <Wifi className="h-3.5 w-3.5" />
        <span>Connesso</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2 bg-red-500/20 text-red-400 text-xs px-3 py-1.5 rounded-full">
      <WifiOff className="h-3.5 w-3.5" />
      <span>Modalità offline</span>
      <AlertCircle className="h-3.5 w-3.5 ml-1" />
    </div>
  );
};
