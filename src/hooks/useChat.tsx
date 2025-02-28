
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAIFunctions } from "@/hooks/chat/useAIFunctions";
import { useAIRequestHandler } from "@/hooks/chat/useAIRequestHandler";
import { useChatMessages } from "@/hooks/chat/useChatMessages";
import { useChatCimiteriHandlers } from "@/hooks/chat/useChatCimiteriHandlers";
import { useOnlineStatus } from "@/hooks/chat/useOnlineStatus";
import LocalLLMManager from "@/lib/llm/localLLMManager";
import { useErrorHandler } from "@/hooks/useErrorHandler";

export const useChat = () => {
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
    handleAIRequest, 
    processAIRequest 
  } = useAIRequestHandler();
  
  const { isOnline, webSearchEnabled, toggleWebSearch } = useOnlineStatus();
  const { handleError } = useErrorHandler({ 
    context: 'chat', 
    showToast: true 
  });
  
  // Monitora lo stato di connessione
  useEffect(() => {
    // Il modello locale verrà caricato automaticamente quando si va offline
  }, []);

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
  
  const handleSubmit = async (event?: React.FormEvent, overrideQuery?: string) => {
    // Previeni il comportamento di default del form
    if (event) {
      event.preventDefault();
    }

    // Verifica che ci sia una query valida e che non sia già in corso una richiesta
    const userQuery = overrideQuery || query;
    if (!userQuery?.trim() || isSubmitting) {
      return;
    }

    // Imposta gli stati di elaborazione
    setIsSubmitting(true);
    
    // Memorizza la query attuale prima di resettarla
    const currentQuery = userQuery;
    
    // Reset della query di input per feedback immediato all'utente
    setQuery("");
    
    try {
      // Aggiungi messaggio utente - attendiamo che l'animazione finisca
      addMessage({ 
        type: "query", 
        role: "user", 
        content: currentQuery, 
        timestamp: new Date() 
      });
      
      // Piccola pausa per permettere all'UI di aggiornarsi
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Forza uno scroll per mostrare il messaggio dell'utente
      safeScrollToBottom();
      
      // Identifica eventuali funzioni AI nella query
      let aiFunction = null;
      try {
        aiFunction = await identifyFunctions(currentQuery);
      } catch (identifyError) {
        console.error("Errore nell'identificazione delle funzioni:", identifyError);
        aiFunction = null;
      }
      
      if (aiFunction) {
        // Aggiungiamo un messaggio di risposta vuoto che verrà aggiornato
        addMessage({ 
          type: "response", 
          role: "assistant",
          content: "Sto elaborando la tua richiesta...",
          timestamp: new Date()
        });
        
        // Forza uno scroll per mostrare l'indicatore di caricamento
        safeScrollToBottom();
        
        try {
          const result = await executeAIFunction(aiFunction, currentQuery);
          
          // Aggiorna il messaggio con la risposta effettiva
          updateLastMessage({ 
            content: result.message || "Funzione eseguita con successo.",
            data: result.data,
            timestamp: new Date()
          });
        } catch (functionError) {
          handleError(
            functionError instanceof Error 
              ? functionError 
              : new Error("Errore nell'esecuzione della funzione AI"), 
            { 
              functionName: aiFunction.name, 
              query: currentQuery 
            }
          );
          
          updateLastMessage({
            content: "Si è verificato un errore nell'elaborazione della richiesta. Riprova più tardi.",
          });
        }
      } else if (currentQuery.toLowerCase().includes("cimitero") || 
                currentQuery.toLowerCase().includes("cimiteri") || 
                currentQuery.toLowerCase().includes("defunto")) {
        
        // Aggiungiamo un messaggio di risposta vuoto che verrà aggiornato
        addMessage({ 
          type: "response", 
          role: "assistant",
          content: "Sto cercando informazioni sui cimiteri...",
          timestamp: new Date()
        });
        
        // Forza uno scroll per mostrare l'indicatore di caricamento
        safeScrollToBottom();
        
        try {
          const result = await handleCimiteriRequest(currentQuery);
          
          // Aggiorna il messaggio con la risposta effettiva
          updateLastMessage({ 
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
              const offlineResponse = await localLLM.processQuery(currentQuery);
              
              updateLastMessage({ 
                content: offlineResponse || "Risposta non disponibile in modalità offline.",
                timestamp: new Date()
              });
            } catch (offlineError) {
              handleError(
                offlineError instanceof Error 
                  ? offlineError 
                  : new Error("Errore nella risposta offline"), 
                { 
                  isOffline: true, 
                  query: currentQuery 
                }
              );
              
              updateLastMessage({
                content: "Si è verificato un errore nella risposta offline. Riprova con una domanda diversa.",
              });
            }
          } else {
            handleError(
              cimiteriError instanceof Error 
                ? cimiteriError 
                : new Error("Errore nella gestione della richiesta cimiteri"), 
              { 
                isOnline: true, 
                query: currentQuery 
              }
            );
            
            updateLastMessage({
              content: "Si è verificato un errore nella ricerca delle informazioni sui cimiteri. Riprova con una domanda diversa.",
            });
          }
        }
      } else {
        // Gestisce richieste generiche all'AI
        // Aggiungiamo un messaggio di risposta vuoto che verrà aggiornato
        addMessage({ 
          type: "response", 
          role: "assistant", 
          content: "Sto elaborando la tua richiesta...", 
          timestamp: new Date() 
        });
        
        // Forza uno scroll per mostrare l'indicatore di caricamento
        safeScrollToBottom();

        // Se siamo offline, utilizza il modello locale
        if (!isOnline) {
          try {
            const localLLM = LocalLLMManager.getInstance();
            const offlineResponse = await localLLM.processQuery(currentQuery);
            
            updateLastMessage({
              content: offlineResponse || "Risposta non disponibile in modalità offline.",
              data: { suggestions: true }
            });
          } catch (localLLMError) {
            handleError(
              localLLMError instanceof Error 
                ? localLLMError 
                : new Error("Errore nel modello locale"), 
              { 
                isOffline: true, 
                query: currentQuery 
              }
            );
            
            updateLastMessage({
              content: "Si è verificato un errore nella risposta offline. Riprova con una domanda diversa.",
            });
          }
        } else {
          // Altrimenti, utilizza il modello online
          try {
            const aiProvider = localStorage.getItem('ai_provider') || 'groq';
            const aiModel = localStorage.getItem('ai_model') || 'mixtral-8x7b-32768';
            
            const response = await processAIRequest(currentQuery, webSearchEnabled, aiProvider, aiModel);
            
            updateLastMessage({
              content: response || "Non ho ricevuto una risposta valida, riprova più tardi.",
              suggestedQuestions: [
                "Mostra l'elenco dei cimiteri",
                "Come posso cercare un defunto?",
                "Quali funzionalità sono disponibili?"
              ]
            });
          } catch (processError) {
            handleError(
              processError instanceof Error 
                ? processError 
                : new Error("Errore nell'elaborazione della richiesta AI"), 
              { 
                aiProvider: localStorage.getItem('ai_provider') || 'groq',
                aiModel: localStorage.getItem('ai_model') || 'mixtral-8x7b-32768',
                webSearchEnabled,
                query: currentQuery 
              }
            );
            
            updateLastMessage({
              content: "Si è verificato un errore nell'elaborazione della richiesta. Riprova più tardi.",
            });
          }
        }
      }
    } catch (error) {
      handleError(
        error instanceof Error 
          ? error 
          : new Error("Errore complessivo nella gestione della richiesta"), 
        { query: currentQuery }
      );
      
      // Aggiorna l'ultimo messaggio solo se è stato creato
      if (messages.length > 0 && messages[messages.length - 1]?.role === 'assistant') {
        updateLastMessage({
          content: "Mi dispiace, si è verificato un errore nell'elaborazione della richiesta. Riprova più tardi.",
        });
      } else {
        // Aggiungi un nuovo messaggio di errore
        addMessage({ 
          type: "response", 
          role: "assistant",
          content: "Mi dispiace, si è verificato un errore nell'elaborazione della richiesta. Riprova più tardi.", 
          timestamp: new Date() 
        });
      }
      
      toast.error("Errore nella risposta", { 
        description: "Si è verificato un errore durante l'elaborazione della richiesta."
      });
    } finally {
      setIsSubmitting(false);
      // Forza uno scroll finale dopo che tutto è stato completato
      setTimeout(safeScrollToBottom, 100);
    }
  };

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
