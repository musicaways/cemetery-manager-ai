
import { useState } from "react";
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
