
import { useState } from "react";
import { useChatCimitero } from "@/pages/cimiteri/hooks/useChatCimitero";
import { useChatMessages } from "./chat/useChatMessages";
import { useAIFunctions } from "./chat/useAIFunctions";
import { useChatCimiteriHandlers } from "./chat/useChatCimiteriHandlers";
import { useAIRequestHandler } from "./chat/useAIRequestHandler";
import { useOnlineStatus } from "./chat/useOnlineStatus";
import type { UseChatReturn } from "./chat/types";
import type { Cimitero } from "@/pages/cimiteri/types";

export const useChat = (): UseChatReturn => {
  const [query, setQuery] = useState("");
  const [selectedCimitero, setSelectedCimitero] = useState<Cimitero | null>(null);
  
  // Hook per la gestione dei messaggi
  const { 
    messages, 
    setMessages, 
    messagesEndRef, 
    scrollAreaRef, 
    handleSearch, 
    scrollToBottom 
  } = useChatMessages();
  
  // Hook per lo stato online
  const { isOnline, webSearchEnabled, toggleWebSearch } = useOnlineStatus();
  
  // Hook per l'accesso ai dati dei cimiteri
  const { findCimiteroByName, getAllCimiteri } = useChatCimitero();
  
  // Hook per le funzioni AI
  const { processTestQuery } = useAIFunctions();
  
  // Hook per la gestione delle richieste sui cimiteri
  const { 
    handleListaCimiteriRequest, 
    handleDettagliCimiteroRequest 
  } = useChatCimiteriHandlers({
    findCimiteroByName,
    getAllCimiteri,
    setMessages,
    isOnline
  });
  
  // Hook per la gestione delle richieste AI
  const { 
    isProcessing, 
    setIsProcessing, 
    handleAIRequest 
  } = useAIRequestHandler({
    setMessages,
    webSearchEnabled,
    isOnline,
    aiHandlers: { processTestQuery },
    scrollToBottom
  });

  /**
   * Gestisce l'invio di una query
   */
  const handleSubmit = async (e?: React.FormEvent, submittedQuery?: string) => {
    e?.preventDefault();
    const finalQuery = submittedQuery || query;
    if (!finalQuery.trim()) return;
    
    setIsProcessing(true);
    setMessages(prev => [...prev, { type: 'query', content: finalQuery }]);

    try {
      const normalizedQuery = finalQuery.toLowerCase().trim();
      console.log(`Query normalizzata: "${normalizedQuery}"`);

      // Prima verifica la funzione "Lista cimiteri"
      const isListaCimiteriRequest = await handleListaCimiteriRequest(normalizedQuery);
      if (isListaCimiteriRequest) {
        setQuery("");
        setIsProcessing(false);
        setTimeout(scrollToBottom, 100);
        return;
      }

      // Poi verifica la funzione "Dettagli cimitero"
      const isDettagliCimiteroRequest = await handleDettagliCimiteroRequest(normalizedQuery);
      if (isDettagliCimiteroRequest) {
        setQuery("");
        setIsProcessing(false);
        setTimeout(scrollToBottom, 100);
        return;
      }

      // Altrimenti procedi con la richiesta AI generica
      await handleAIRequest(finalQuery);
      setQuery("");
      
    } catch (error) {
      console.error("Errore dettagliato:", error);
    } finally {
      setIsProcessing(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  return {
    query,
    setQuery,
    isProcessing,
    messages,
    webSearchEnabled,
    messagesEndRef,
    scrollAreaRef,
    selectedCimitero,
    setSelectedCimitero,
    handleSearch,
    handleSubmit,
    toggleWebSearch,
    isOnline
  };
};
