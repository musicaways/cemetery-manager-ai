
import { useCallback } from 'react';
import { errorReporter } from '@/lib/errorReporter';
import { toast } from 'sonner';

/**
 * Hook per gestire gli errori nei componenti
 * @param options Opzioni di configurazione
 */
export function useErrorHandler(options: {
  showToast?: boolean;
  toastDuration?: number;
  context?: string;
} = {}) {
  const {
    showToast = true,
    toastDuration = 5000,
    context = ''
  } = options;

  /**
   * Funzione per gestire gli errori
   */
  const handleError = useCallback((error: Error, metadata: Record<string, any> = {}) => {
    const contextPrefix = context ? `[${context}] ` : '';
    
    // Se l'errore è già formattato, non aggiungere il prefisso
    const errorMessage = error.message.startsWith('[') 
      ? error.message 
      : `${contextPrefix}${error.message}`;
      
    const errorWithContext = new Error(errorMessage);
    errorWithContext.stack = error.stack;

    // Log esteso dell'errore nella console
    console.group('Errore gestito');
    console.error('Messaggio:', errorMessage);
    console.error('Stack:', error.stack);
    console.error('Metadati:', metadata);
    console.groupEnd();

    // Riporta l'errore
    errorReporter.reportError(errorWithContext, {
      ...metadata,
      context,
      handledAt: 'component'
    }, true);

    // Mostra un toast di errore se richiesto
    if (showToast) {
      const errorDescription = metadata?.userMessage || error.message;
      
      toast.error('Si è verificato un errore', {
        description: errorDescription.length > 100 
          ? errorDescription.substring(0, 100) + '...' 
          : errorDescription,
        duration: toastDuration,
        action: {
          label: 'Dettagli',
          onClick: () => {
            toast.info('Dettagli errore', {
              description: error.message,
              duration: 10000
            });
          }
        }
      });
    }

    // Ritorna l'errore per consentire concatenazione
    return error;
  }, [showToast, toastDuration, context]);

  /**
   * Wrapper per funzioni asincrone che gestisce automaticamente gli errori
   */
  const wrapAsync = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    metadata: Record<string, any> = {}
  ) => {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args);
      } catch (error) {
        handleError(error instanceof Error ? error : new Error(String(error)), metadata);
        throw error; // Propaga l'errore
      }
    };
  }, [handleError]);

  return {
    handleError,
    wrapAsync
  };
}
