
import { useCallback } from "react";
import { Message } from "./types";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import LocalLLMManager from "@/lib/llm/localLLMManager";
import { toast } from "sonner";

export const useChatSubmitHandler = ({
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
}: {
  setIsSubmitting: (value: boolean) => void;
  setQuery: (value: string) => void;
  addMessage: (message: Message) => void;
  updateLastMessage: (update: Partial<Message>) => void;
  safeScrollToBottom: () => void;
  identifyFunctions: (query: string) => Promise<any>;
  executeAIFunction: (functionId: string, query: string) => Promise<any>;
  handleCimiteriRequest: (query: string) => Promise<any>;
  processAIRequest: (query: string, webSearchEnabled: boolean, aiProvider: string, aiModel: string) => Promise<any>;
  isOnline: boolean;
  webSearchEnabled: boolean;
  messages: Message[];
}) => {
  const { handleError } = useErrorHandler({ 
    context: 'chat-submit', 
    showToast: true 
  });

  const handleSubmit = useCallback(async (event?: React.FormEvent, overrideQuery?: string) => {
    // Previeni il comportamento di default del form
    if (event) {
      event.preventDefault();
    }

    // Verifica che ci sia una query valida e che non sia già in corso una richiesta
    const userQuery = overrideQuery || "";
    if (!userQuery?.trim()) {
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
        await handleAIFunctionRequest(currentQuery, aiFunction);
      } else if (currentQuery.toLowerCase().includes("cimitero") || 
                currentQuery.toLowerCase().includes("cimiteri") || 
                currentQuery.toLowerCase().includes("defunto")) {
        await handleCemeteryRequest(currentQuery);
      } else {
        await handleGenericRequest(currentQuery);
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
  }, [
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
    messages,
    handleError
  ]);

  const handleAIFunctionRequest = useCallback(async (currentQuery: string, aiFunction: any) => {
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
  }, [addMessage, safeScrollToBottom, executeAIFunction, updateLastMessage, handleError]);

  const handleCemeteryRequest = useCallback(async (currentQuery: string) => {
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
  }, [addMessage, safeScrollToBottom, handleCimiteriRequest, updateLastMessage, isOnline, handleError]);

  const handleGenericRequest = useCallback(async (currentQuery: string) => {
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
  }, [addMessage, safeScrollToBottom, isOnline, webSearchEnabled, processAIRequest, updateLastMessage, handleError]);

  return { handleSubmit };
};
