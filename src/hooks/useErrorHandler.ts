
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
    const errorWithContext = new Error(`${contextPrefix}${error.message}`);
    errorWithContext.stack = error.stack;

    // Riporta l'errore
    errorReporter.reportError(errorWithContext, {
      ...metadata,
      context,
      handledAt: 'component'
    }, true);

    // Mostra un toast di errore se richiesto
    if (showToast) {
      toast.error('Si è verificato un errore', {
        description: error.message,
        duration: toastDuration,
        action: {
          label: 'Dettagli',
          onClick: () => {
            console.error(error);
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
