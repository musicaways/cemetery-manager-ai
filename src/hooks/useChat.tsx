
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAIFunctions } from "@/hooks/chat/useAIFunctions";
import { useAIRequestHandler } from "@/hooks/chat/useAIRequestHandler";
import { useChatMessages } from "@/hooks/chat/useChatMessages";
import { useChatCimiteriHandlers } from "@/hooks/chat/useChatCimiteriHandlers";
import { useOnlineStatus } from "@/hooks/chat/useOnlineStatus";
import LocalLLMManager from "@/lib/llm/localLLMManager";

export const useChat = () => {
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
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
  const { processAIRequest } = useAIRequestHandler();
  const { isOnline, webSearchEnabled, toggleWebSearch } = useOnlineStatus();
  
  // Monitora lo stato di connessione e inizializza il modello locale quando necessario
  useEffect(() => {
    // Il modello locale verrà caricato automaticamente quando si va offline
    // attraverso l'event listener nel LocalLLMManager
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSubmit = async (event?: React.FormEvent, overrideQuery?: string) => {
    const userQuery = overrideQuery || query;
    if (event) event.preventDefault();
    if (!userQuery.trim() || isProcessing) return;

    setIsProcessing(true);
    addMessage({ 
      type: "query", 
      role: "user", 
      content: userQuery, 
      timestamp: new Date() 
    });
    setQuery("");

    try {
      // Identifica eventuali funzioni AI nella query
      const aiFunction = await identifyFunctions(userQuery);
      
      if (aiFunction) {
        // Esegue una funzione AI specifica
        const result = await executeAIFunction(aiFunction, userQuery);
        addMessage({ 
          type: "response", 
          role: "assistant",
          content: result.message, 
          data: result.data,
          timestamp: new Date()
        });
      } else if (userQuery.toLowerCase().includes("cimitero") || userQuery.toLowerCase().includes("cimiteri") || userQuery.toLowerCase().includes("defunto")) {
        // Gestisce richieste relative ai cimiteri
        try {
          const result = await handleCimiteriRequest(userQuery);
          addMessage({ 
            type: "response", 
            role: "assistant",
            content: result.message, 
            data: result.data,
            timestamp: new Date()
          });
        } catch (error) {
          console.error("Errore nella gestione della richiesta cimiteri:", error);
          
          // Se siamo offline, usa il modello locale
          if (!isOnline) {
            const localLLM = LocalLLMManager.getInstance();
            const offlineResponse = await localLLM.processQuery(userQuery);
            
            addMessage({ 
              type: "response", 
              role: "assistant",
              content: offlineResponse,
              timestamp: new Date()
            });
          } else {
            throw error; // Rilancia l'errore se siamo online
          }
        }
      } else {
        // Gestisce richieste generiche all'AI
        addMessage({ 
          type: "response", 
          role: "assistant", 
          content: "", 
          timestamp: new Date() 
        });

        // Se siamo offline, utilizza il modello locale
        if (!isOnline) {
          const localLLM = LocalLLMManager.getInstance();
          const offlineResponse = await localLLM.processQuery(userQuery);
          
          updateLastMessage({
            content: offlineResponse,
            data: { suggestions: true }
          });
        } else {
          // Altrimenti, utilizza il modello online
          const aiProvider = localStorage.getItem('ai_provider') || 'groq';
          const aiModel = localStorage.getItem('ai_model') || 'mixtral-8x7b-32768';
          
          const response = await processAIRequest(userQuery, webSearchEnabled, aiProvider, aiModel);
          
          updateLastMessage({
            content: response,
            suggestedQuestions: [
              "Mostra l'elenco dei cimiteri",
              "Come posso cercare un defunto?",
              "Quali funzionalità sono disponibili?"
            ]
          });
        }
      }
    } catch (error) {
      console.error("Errore nella gestione della richiesta:", error);
      
      // Se siamo offline, tentiamo di utilizzare il modello locale come fallback
      if (!isOnline) {
        try {
          const localLLM = LocalLLMManager.getInstance();
          const offlineResponse = await localLLM.processQuery(userQuery);
          
          updateLastMessage({
            content: offlineResponse,
            suggestedQuestions: [
              "Quali funzionalità posso usare offline?",
              "Mostra cimiteri disponibili",
              "Come cercare un defunto in modalità offline"
            ]
          });
        } catch (fallbackError) {
          console.error("Errore nel fallback offline:", fallbackError);
          updateLastMessage({
            content: "Mi dispiace, si è verificato un errore nell'elaborazione della richiesta in modalità offline. Riprova quando sarai nuovamente online.",
          });
        }
      } else {
        updateLastMessage({
          content: "Mi dispiace, si è verificato un errore nell'elaborazione della richiesta. Riprova più tardi.",
        });
      }
      
      toast.error("Errore nella risposta", { description: "Si è verificato un errore durante l'elaborazione della richiesta." });
    } finally {
      setIsProcessing(false);
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
    handleSubmit,
    toggleWebSearch,
    isOnline
  };
};
