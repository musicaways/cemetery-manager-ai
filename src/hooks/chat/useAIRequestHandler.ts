
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { ChatMessage } from "./types";
import type { AIResponse, QueryRequest } from "@/utils/types";
import type { useAIFunctions } from "./useAIFunctions";

interface UseAIRequestHandlerParams {
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  webSearchEnabled: boolean;
  isOnline: boolean;
  aiHandlers: Pick<ReturnType<typeof useAIFunctions>, 'processTestQuery'>;
  scrollToBottom: () => void;
}

export const useAIRequestHandler = ({
  setMessages,
  webSearchEnabled,
  isOnline,
  aiHandlers,
  scrollToBottom
}: UseAIRequestHandlerParams) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleAIRequest = async (query: string): Promise<void> => {
    try {
      // Se non siamo online, rispondi con un messaggio di errore
      if (!isOnline) {
        setMessages(prev => [...prev, { 
          type: 'response', 
          content: `Mi dispiace, ma non posso rispondere a questa domanda in modalità offline. Puoi comunque visualizzare la lista dei cimiteri disponibili o cercare un cimitero specifico.`,
          timestamp: new Date()
        }]);
        setTimeout(scrollToBottom, 100);
        return;
      }

      // Se siamo online, procedi con la richiesta AI standard
      const aiProvider = localStorage.getItem('ai_provider') || 'groq';
      const aiModel = localStorage.getItem('ai_model') || 'mixtral-8x7b-32768';
      
      let response;
      
      if (query.toLowerCase().startsWith("/test-model")) {
        response = await aiHandlers.processTestQuery(aiProvider, aiModel);
      } else {
        const requestBody: QueryRequest = {
          query: query.trim(),
          queryType: webSearchEnabled ? 'web' : 'database',
          aiProvider,
          aiModel,
          isTest: false,
          allowGenericResponse: true
        };

        console.log("Invio richiesta:", requestBody);
        
        const { data, error } = await supabase.functions.invoke<AIResponse>('process-query', {
          body: requestBody
        });

        console.log("Risposta ricevuta:", { data, error });

        if (error) throw error;
        response = data;
      }
      
      if (response) {
        // Verifica di sicurezza per le risposte di tipo 'cimiteri'
        if (response.data && response.data.type === 'cimiteri') {
          // Se la risposta contiene dati di tipo 'cimiteri' ma non era una richiesta esplicita,
          // sostituisci con una risposta generica
          response = {
            text: `Mi dispiace, non ho capito la tua richiesta. Se vuoi vedere la lista dei cimiteri, prova a chiedere "lista dei cimiteri".`,
            data: null
          };
        }
        
        setMessages(prev => [...prev, { 
          type: 'response', 
          content: response.text || '',
          data: response.data,
          timestamp: new Date()
        }]);
        
        if (response.error) {
          toast.error(response.error, { duration: 2000 });
        }
      }
    } catch (error) {
      console.error("Errore dettagliato:", error);
      toast.error("Errore durante l'elaborazione della richiesta. " + (error as Error).message, {
        duration: 2000
      });
    }
  };

  return {
    isProcessing,
    setIsProcessing,
    handleAIRequest
  };
};
