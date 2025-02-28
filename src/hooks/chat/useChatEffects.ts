
import { useEffect, useCallback } from "react";

export const useChatEffects = ({
  messages,
  isProcessing,
  scrollToBottom
}: {
  messages: any[];
  isProcessing: boolean;
  scrollToBottom: () => void;
}) => {
  // Ottimizzazione: useCallback per la funzione di scrollToBottom
  const safeScrollToBottom = useCallback(() => {
    try {
      scrollToBottom();
    } catch (error) {
      console.error("Errore nello scroll:", error);
    }
  }, [scrollToBottom]);

  // Effetto ottimizzato: scroll solo quando necessario
  useEffect(() => {
    if (messages.length > 0 && !isProcessing) {
      // Uso setTimeout per assicurarmi che il DOM sia stato aggiornato
      setTimeout(safeScrollToBottom, 50);
    }
  }, [messages, isProcessing, safeScrollToBottom]);
  
  return { safeScrollToBottom };
};
