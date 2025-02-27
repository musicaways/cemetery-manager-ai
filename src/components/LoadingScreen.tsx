
import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { performanceMonitor } from '@/lib/performanceMonitor';

interface LoadingScreenProps {
  message?: string;
  timeout?: number;
}

export const LoadingScreen = ({ 
  message = 'Caricamento in corso...', 
  timeout = 10000 
}: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [showTimeout, setShowTimeout] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    // Monitora il tempo di caricamento
    const endMeasure = performanceMonitor.startMeasure('loading-screen-duration', 'render');
    
    // Incrementa progressivamente la barra di progresso
    const startTime = Date.now();
    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setElapsedTime(elapsed);
      
      // Calcola il progresso con una funzione logaritmica per rallentare col tempo
      // Arriva al 90% in timeout/2 ms, poi rallenta
      const calculatedProgress = Math.min(
        90, 
        Math.log(1 + (elapsed / (timeout / 2)) * 10) * 30
      );
      
      setProgress(calculatedProgress);
      
      // Dopo un timeout, mostra un messaggio aggiuntivo
      if (elapsed > timeout && !showTimeout) {
        setShowTimeout(true);
      }
    }, 100);
    
    return () => {
      clearInterval(intervalId);
      endMeasure();
    };
  }, [timeout]);

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-4 z-50">
      <div className="max-w-md w-full space-y-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"/>
        </div>
        
        <Progress value={progress} className="w-full" />
        
        <p className="text-center text-muted-foreground">{message}</p>
        
        {showTimeout && (
          <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-3 rounded-md text-sm">
            Il caricamento sta richiedendo più tempo del previsto. 
            Se riscontri problemi, prova a ricaricare la pagina.
          </div>
        )}
      </div>
    </div>
  );
};

export const SkeletonLoader = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`animate-pulse bg-muted rounded-md ${className}`} />
  );
};
