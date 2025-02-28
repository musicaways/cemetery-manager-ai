
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LocalLLMManager from "@/lib/llm/localLLMManager";

export const useAIRequestHandler = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  // Ottimizzato con useCallback per evitare ricreazioni non necessarie
  const handleAIRequest = useCallback(async (query: string) => {
    if (!query?.trim()) {
      return "Mi dispiace, non ho ricevuto una domanda valida.";
    }
    
    // Imposta lo stato di elaborazione iniziale
    setIsProcessing(true);
    setProcessingProgress(10); // Avvio elaborazione
    
    try {
      const aiProvider = localStorage.getItem('ai_provider') || 'groq';
      const aiModel = localStorage.getItem('ai_model') || 'mixtral-8x7b-32768';
      
      setProcessingProgress(30); // Modello selezionato
      
      // Attendi un breve periodo per garantire che l'UI si aggiorni correttamente
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const response = await processAIRequest(query, false, aiProvider, aiModel);
      setProcessingProgress(100); // Completato
      
      return response;
    } catch (error) {
      console.error('Errore nella richiesta AI:', error);
      toast.error('Errore nella risposta', {
        description: 'Si è verificato un errore durante l\'elaborazione della richiesta.'
      });
      
      return "Mi dispiace, si è verificato un errore nell'elaborazione della richiesta. Riprova più tardi.";
    } finally {
      // Breve ritardo prima di disattivare lo stato di elaborazione per garantire una transizione fluida
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingProgress(0);
      }, 300);
    }
  }, []);
  
  // Ottimizzato con useCallback per evitare ricreazioni non necessarie
  const processAIRequest = useCallback(async (query: string, webSearchEnabled: boolean, aiProvider: string, aiModel: string) => {
    if (!query?.trim()) {
      return "Mi dispiace, non ho ricevuto una domanda valida.";
    }
    
    try {
      // Incrementa progresso per feedback visivo
      setProcessingProgress(prevProgress => Math.max(prevProgress, 50));
      
      // Se è richiesta la ricerca web o se stiamo usando un provider cloud
      if (webSearchEnabled || (aiProvider !== 'huggingface' && navigator.onLine)) {
        try {
          // Piccola pausa per evitare flash dello schermo nero
          await new Promise(resolve => setTimeout(resolve, 50));
          
          const response = await supabase.functions.invoke('process-query', {
            body: { 
              query,
              webSearch: webSearchEnabled,
              aiProvider,
              aiModel
            }
          });
          
          setProcessingProgress(90);
          
          if (response.error) {
            console.error('Errore nella risposta di Supabase Edge Function:', response.error);
            throw response.error;
          }
          
          return response.data;
        } catch (supabaseError) {
          console.error('Errore durante l\'invocazione della funzione Supabase:', supabaseError);
          throw supabaseError;
        }
      } else {
        // Utilizziamo il modello locale
        try {
          setProcessingProgress(60);
          
          // Piccola pausa per evitare flash dello schermo nero
          await new Promise(resolve => setTimeout(resolve, 50));
          
          const localLLM = LocalLLMManager.getInstance();
          const response = await localLLM.processQuery(query);
          setProcessingProgress(90);
          return response;
        } catch (localLLMError) {
          console.error('Errore nell\'utilizzo del modello locale:', localLLMError);
          throw localLLMError;
        }
      }
    } catch (error) {
      console.error('Errore nel processare la richiesta AI:', error);
      throw error;
    }
  }, []);

  return {
    isProcessing,
    processingProgress,
    setIsProcessing,
    setProcessingProgress,
    handleAIRequest,
    processAIRequest
  };
};
