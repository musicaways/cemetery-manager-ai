
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAIFunctions } from "@/hooks/chat/useAIFunctions";
import { useAIRequestHandler } from "@/hooks/chat/useAIRequestHandler";
import { useChatMessages } from "@/hooks/chat/useChatMessages";
import { useChatCimiteriHandlers } from "@/hooks/chat/useChatCimiteriHandlers";
import { useOnlineStatus } from "@/hooks/chat/useOnlineStatus";
import { useChatEffects } from "@/hooks/chat/useChatEffects";
import { useChatSubmitHandler } from "@/hooks/chat/useChatSubmitHandler";
import { UseChatReturn } from "@/hooks/chat/types";

export const useChat = (): UseChatReturn => {
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  const { 
    messages, 
    messagesEndRef, 
    scrollAreaRef, 
    addMessage, 
    updateLastMessage,
    scrollToBottom 
  } = useChatMessages();
  
  const { handleCimiteriRequest } = useChatCimiteriHandlers();
  const { executeAIFunction, identifyFunctions } = useAIFunctions();
  const { 
    isProcessing, 
    processingProgress, 
    processAIRequest 
  } = useAIRequestHandler();
  
  const { isOnline, webSearchEnabled, toggleWebSearch } = useOnlineStatus();
  
  const { safeScrollToBottom } = useChatEffects({
    messages,
    isProcessing: isProcessing || isSubmitting,
    scrollToBottom
  });
  
  const { handleSubmit } = useChatSubmitHandler({
    setIsSubmitting,
    setQuery,
    addMessage,
    updateLastMessage,
    safeScrollToBottom,
    identifyFunctions,
    executeAIFunction,
    handleCimiteriRequest,
    processAIRequest,
    isOnline,
    webSearchEnabled,
    messages
  });

  // Assicura un'inizializzazione completa prima di permettere interazioni
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Se l'hook non è pronto, restituiamo comunque un oggetto valido per evitare errori di rendering
  if (!isReady) {
    return {
      query: "",
      setQuery: () => {},
      isProcessing: true, // Imposta come in elaborazione per evitare interazioni premature
      processingProgress: 0,
      messages: [],
      webSearchEnabled: false,
      messagesEndRef,
      scrollAreaRef,
      handleSubmit: () => Promise.resolve(),
      toggleWebSearch: () => {},
      isOnline: false
    };
  }

  return {
    query,
    setQuery,
    isProcessing: isProcessing || isSubmitting,
    processingProgress,
    messages,
    webSearchEnabled,
    messagesEndRef,
    scrollAreaRef,
    handleSubmit,
    toggleWebSearch,
    isOnline
  };
};
