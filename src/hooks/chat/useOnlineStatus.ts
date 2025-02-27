
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  
  // Gestione dello stato online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleWebSearch = () => {
    if (!isOnline && !webSearchEnabled) {
      toast.error("La modalità Internet non è disponibile offline", { duration: 2000 });
      return;
    }
    
    setWebSearchEnabled(!webSearchEnabled);
    toast.success(
      !webSearchEnabled 
        ? "Modalità Internet attivata" 
        : "Modalità Database attivata",
      { duration: 2000 }
    );
  };

  return {
    isOnline,
    webSearchEnabled,
    toggleWebSearch
  };
};
