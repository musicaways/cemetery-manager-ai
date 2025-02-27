
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  
  // Gestione dello stato online/offline
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Connessione ristabilita", {
        description: "Sei tornato online. Tutte le funzionalità sono disponibili.",
        duration: 3000
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error("Connessione persa", {
        description: "Sei passato in modalità offline. Alcune funzionalità potrebbero non essere disponibili.",
        duration: 3000
      });
    };
    
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
