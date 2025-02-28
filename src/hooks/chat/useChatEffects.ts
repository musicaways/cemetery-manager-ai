
import { useEffect, useCallback, useRef } from "react";

export const useChatEffects = ({
  messages,
  isProcessing,
  scrollToBottom
}: {
  messages: any[];
  isProcessing: boolean;
  scrollToBottom: () => void;
}) => {
  // Riferimenti per prevenire condizioni di race
  const processingRef = useRef(isProcessing);
  const scrollTimeoutRef = useRef<number | null>(null);

  // Aggiorna il ref quando lo stato di isProcessing cambia
  useEffect(() => {
    processingRef.current = isProcessing;
  }, [isProcessing]);

  // Ottimizzazione: useCallback per la funzione di scrollToBottom
  const safeScrollToBottom = useCallback(() => {
    try {
      // Cancella il timeout precedente se esiste
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }

      // Esegui lo scroll immediatamente
      scrollToBottom();
      
      // Pianifica un altro scroll dopo un breve intervallo per assicurarsi
      // che tutti gli elementi siano stati renderizzati
      scrollTimeoutRef.current = window.setTimeout(() => {
        scrollToBottom();
        scrollTimeoutRef.current = null;
      }, 100);
    } catch (error) {
      console.error("Errore nello scroll:", error);
    }
  }, [scrollToBottom]);

  // Effetto ottimizzato: scroll solo quando necessario
  useEffect(() => {
    if (messages.length > 0) {
      // Piccolo ritardo per garantire che il DOM sia aggiornato
      const timeoutId = window.setTimeout(() => {
        safeScrollToBottom();
      }, 50);
      
      return () => window.clearTimeout(timeoutId);
    }
  }, [messages, safeScrollToBottom]);
  
  // Pulisci i timeout quando il componente viene smontato
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);
  
  return { safeScrollToBottom };
};
