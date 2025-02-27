
import { useEffect, useRef } from 'react';
import { eventBus } from '@/lib/eventBus';

/**
 * Hook per sottoscriversi a eventi dell'applicazione
 * @param eventName Nome dell'evento
 * @param callback Funzione da eseguire quando l'evento viene attivato
 * @param deps Dipendenze per cui ricaricare la sottoscrizione (come useEffect)
 */
export function useAppEvent(
  eventName: string, 
  callback: (...args: any[]) => void, 
  deps: React.DependencyList = []
): void {
  const callbackRef = useRef(callback);
  
  // Aggiorna il riferimento al callback quando cambia
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  useEffect(() => {
    // Wrapper per assicurarsi di usare sempre l'ultima versione del callback
    const wrappedCallback = (...args: any[]) => {
      callbackRef.current(...args);
    };
    
    // Sottoscrivi all'evento
    const unsubscribe = eventBus.subscribe(eventName, wrappedCallback);
    
    // Pulizia alla smontaggio
    return () => {
      unsubscribe();
    };
  }, [eventName, ...deps]);
}

/**
 * Hook per pubblicare eventi dell'applicazione
 * @returns Funzione per pubblicare eventi
 */
export function useEventPublisher() {
  return {
    publish: eventBus.publish.bind(eventBus)
  };
}
