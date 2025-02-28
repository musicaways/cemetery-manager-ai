
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
  
  // Monitora lo stato di connessione
  useEffect(() => {
    // Il modello locale verrà caricato automaticamente quando si va offline
  }, []);

  useEffect(() => {
    try {
      scrollToBottom();
    } catch (error) {
      console.error("Errore nello scroll:", error);
    }
  }, [messages, scrollToBottom]);
  
  const handleSubmit = async (event?: React.FormEvent, overrideQuery?: string) => {
    // Previeni il comportamento di default del form
    if (event) {
      event.preventDefault();
    }

    // Verifica che ci sia una query valida
    const userQuery = overrideQuery || query;
    if (!userQuery?.trim() || isProcessing) {
      return;
    }

    // Imposta lo stato di elaborazione
    setIsProcessing(true);
    
    // Aggiungi messaggio utente
    try {
      addMessage({ 
        type: "query", 
        role: "user", 
        content: userQuery, 
        timestamp: new Date() 
      });
      
      // Reset della query di input
      setQuery("");
    } catch (error) {
      console.error("Errore nell'aggiunta del messaggio:", error);
      setIsProcessing(false);
      return;
    }

    try {
      // Identifica eventuali funzioni AI nella query
      let aiFunction = null;
      try {
        aiFunction = await identifyFunctions(userQuery);
      } catch (identifyError) {
        console.error("Errore nell'identificazione delle funzioni:", identifyError);
        aiFunction = null;
      }
      
      if (aiFunction) {
        // Esegue una funzione AI specifica
        try {
          const result = await executeAIFunction(aiFunction, userQuery);
          addMessage({ 
            type: "response", 
            role: "assistant",
            content: result.message || "Funzione eseguita con successo.", 
            data: result.data,
            timestamp: new Date()
          });
        } catch (functionError) {
          console.error("Errore nell'esecuzione della funzione AI:", functionError);
          throw functionError;
        }
      } else if (userQuery.toLowerCase().includes("cimitero") || 
                userQuery.toLowerCase().includes("cimiteri") || 
                userQuery.toLowerCase().includes("defunto")) {
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
        } catch (cimiteriError) {
          console.error("Errore nella gestione della richiesta cimiteri:", cimiteriError);
          
          // Se siamo offline, usa il modello locale
          if (!isOnline) {
            try {
              const localLLM = LocalLLMManager.getInstance();
              const offlineResponse = await localLLM.processQuery(userQuery);
              
              addMessage({ 
                type: "response", 
                role: "assistant",
                content: offlineResponse || "Risposta non disponibile in modalità offline.",
                timestamp: new Date()
              });
            } catch (offlineError) {
              console.error("Errore nella risposta offline:", offlineError);
              throw offlineError;
            }
          } else {
            throw cimiteriError; // Rilancia l'errore se siamo online
          }
        }
      } else {
        // Gestisce richieste generiche all'AI
        try {
          addMessage({ 
            type: "response", 
            role: "assistant", 
            content: "", 
            timestamp: new Date() 
          });

          // Se siamo offline, utilizza il modello locale
          if (!isOnline) {
            try {
              const localLLM = LocalLLMManager.getInstance();
              const offlineResponse = await localLLM.processQuery(userQuery);
              
              updateLastMessage({
                content: offlineResponse || "Risposta non disponibile in modalità offline.",
                data: { suggestions: true }
              });
            } catch (localLLMError) {
              console.error("Errore nel modello locale:", localLLMError);
              throw localLLMError;
            }
          } else {
            // Altrimenti, utilizza il modello online
            try {
              const aiProvider = localStorage.getItem('ai_provider') || 'groq';
              const aiModel = localStorage.getItem('ai_model') || 'mixtral-8x7b-32768';
              
              const response = await processAIRequest(userQuery, webSearchEnabled, aiProvider, aiModel);
              
              updateLastMessage({
                content: response || "Non ho ricevuto una risposta valida, riprova più tardi.",
                suggestedQuestions: [
                  "Mostra l'elenco dei cimiteri",
                  "Come posso cercare un defunto?",
                  "Quali funzionalità sono disponibili?"
                ]
              });
            } catch (processError) {
              console.error("Errore nell'elaborazione della richiesta AI:", processError);
              throw processError;
            }
          }
        } catch (genericError) {
          console.error("Errore nella gestione della richiesta generica:", genericError);
          throw genericError;
        }
      }
    } catch (error) {
      console.error("Errore complessivo nella gestione della richiesta:", error);
      
      // Se siamo offline, tentiamo di utilizzare il modello locale come fallback
      if (!isOnline) {
        try {
          const localLLM = LocalLLMManager.getInstance();
          const offlineResponse = await localLLM.processQuery(userQuery);
          
          updateLastMessage({
            content: offlineResponse || "Risposta di fallback non disponibile.",
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
      
      toast.error("Errore nella risposta", { 
        description: "Si è verificato un errore durante l'elaborazione della richiesta."
      });
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
