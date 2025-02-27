
import { useEffect, useState } from 'react';
import { eventBus, AppEvents } from '@/lib/eventBus';
import { toast } from 'sonner';
import { WifiOff, Wifi, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { performanceMonitor } from '@/lib/performanceMonitor';

export const ConnectivityManager = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineDuration, setOfflineDuration] = useState(0);
  const [offlineStartTime, setOfflineStartTime] = useState<number | null>(null);

  useEffect(() => {
    // Monitora lo stato della connessione
    const handleOnline = () => {
      setIsOnline(true);
      
      // Calcola la durata offline
      if (offlineStartTime) {
        const duration = Date.now() - offlineStartTime;
        setOfflineDuration(duration);
        setOfflineStartTime(null);
        
        // Registra la metrica
        performanceMonitor.recordMetric(
          'network',
          'offline-duration',
          duration / 1000,
          's'
        );
      }
      
      // Pubblica l'evento di connettività
      eventBus.publish(AppEvents.CONNECTIVITY_CHANGE, true);
      
      // Mostra un toast quando torniamo online
      toast.success('Connessione ripristinata', {
        description: 'Sincronizzazione dei dati in corso...',
        duration: 3000
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setOfflineStartTime(Date.now());
      
      // Pubblica l'evento di connettività
      eventBus.publish(AppEvents.CONNECTIVITY_CHANGE, false);
      
      // Mostra un toast quando andiamo offline
      toast.warning('Modalità offline', {
        description: 'L\'app continuerà a funzionare con funzionalità limitate',
        duration: 5000
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineStartTime]);

  // Non rendiamo nulla direttamente - questo è un manager di stato
  return null;
};

export const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(!navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Nascondiamo il banner con un po' di ritardo per dare
      // tempo di completare la sincronizzazione
      setTimeout(() => setShowBanner(false), 3000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (!showBanner) {
    return null;
  }
  
  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform ${
        showBanner ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className={`py-2 px-4 flex items-center justify-between ${
        isOnline 
          ? 'bg-green-50 text-green-800 border-b border-green-200' 
          : 'bg-amber-950/40 text-amber-200 border-b border-amber-800/30'
      }`}>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-4 w-4" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">
            {isOnline 
              ? 'Connessione ripristinata' 
              : 'Modalità offline attiva'}
          </span>
        </div>
        
        {!isOnline && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 text-amber-200 hover:text-white hover:bg-amber-800/30"
            onClick={() => setShowBanner(false)}
          >
            Nascondi
          </Button>
        )}
      </div>
    </div>
  );
};
