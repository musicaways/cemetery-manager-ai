
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LocalLLMManager from "@/lib/llm/localLLMManager";

export const useAIRequestHandler = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAIRequest = async (query: string) => {
    if (!query?.trim()) {
      return "Mi dispiace, non ho ricevuto una domanda valida.";
    }
    
    setIsProcessing(true);
    
    try {
      const aiProvider = localStorage.getItem('ai_provider') || 'groq';
      const aiModel = localStorage.getItem('ai_model') || 'mixtral-8x7b-32768';
      
      const response = await processAIRequest(query, false, aiProvider, aiModel);
      
      return response;
    } catch (error) {
      console.error('Errore nella richiesta AI:', error);
      toast.error('Errore nella risposta', {
        description: 'Si è verificato un errore durante l\'elaborazione della richiesta.'
      });
      
      return "Mi dispiace, si è verificato un errore nell'elaborazione della richiesta. Riprova più tardi.";
    } finally {
      setIsProcessing(false);
    }
  };
  
  const processAIRequest = async (query: string, webSearchEnabled: boolean, aiProvider: string, aiModel: string) => {
    if (!query?.trim()) {
      return "Mi dispiace, non ho ricevuto una domanda valida.";
    }
    
    try {
      // Se è richiesta la ricerca web o se stiamo usando un provider cloud
      if (webSearchEnabled || (aiProvider !== 'huggingface' && navigator.onLine)) {
        try {
          const response = await supabase.functions.invoke('process-query', {
            body: { 
              query,
              webSearch: webSearchEnabled,
              aiProvider,
              aiModel
            }
          });
          
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
          const localLLM = LocalLLMManager.getInstance();
          return await localLLM.processQuery(query);
        } catch (localLLMError) {
          console.error('Errore nell\'utilizzo del modello locale:', localLLMError);
          throw localLLMError;
        }
      }
    } catch (error) {
      console.error('Errore nel processare la richiesta AI:', error);
      throw error;
    }
  };

  return {
    isProcessing,
    setIsProcessing,
    handleAIRequest,
    processAIRequest
  };
};
