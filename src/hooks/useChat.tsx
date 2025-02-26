
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useChatCimitero } from "@/pages/cimiteri/hooks/useChatCimitero";
import { useChatMessages } from "./chat/useChatMessages";
import { useAIFunctions } from "./chat/useAIFunctions";
import type { UseChatReturn } from "./chat/types";
import type { Cimitero } from "@/pages/cimiteri/types";
import type { AIResponse, QueryRequest } from "@/utils/types";

export const useChat = (): UseChatReturn => {
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [selectedCimitero, setSelectedCimitero] = useState<Cimitero | null>(null);
  
  const { findCimiteroByName, getAllCimiteri } = useChatCimitero();
  const { messages, setMessages, messagesEndRef, scrollAreaRef, handleSearch, scrollToBottom } = useChatMessages();
  const { processTestQuery, getActiveFunctions, findMatchingFunction } = useAIFunctions();

  const handleSubmit = async (e?: React.FormEvent, submittedQuery?: string) => {
    e?.preventDefault();
    const finalQuery = submittedQuery || query;
    if (!finalQuery.trim()) return;
    
    setIsProcessing(true);
    setMessages(prev => [...prev, { type: 'query', content: finalQuery }]);

    try {
      const normalizedQuery = finalQuery.toLowerCase();

      // Verifica funzioni AI attive
      const aiFunctions = await getActiveFunctions();
      const matchedFunction = findMatchingFunction(normalizedQuery, aiFunctions);

      if (matchedFunction) {
        console.log("Funzione AI trovata:", matchedFunction);
        try {
          // Esegui il codice della funzione AI
          const functionCode = new Function('query', 'findCimiteroByName', 'getAllCimiteri', `
            return (async () => {
              ${matchedFunction.code}
            })();
          `);
          
          const result = await functionCode(normalizedQuery, findCimiteroByName, getAllCimiteri);
          if (result) {
            setMessages(prev => [...prev, {
              type: 'response',
              content: result.text,
              data: result.data,
              timestamp: new Date()
            }]);
            setQuery("");
            setIsProcessing(false);
            setTimeout(scrollToBottom, 100);
            return;
          }
        } catch (error) {
          console.error("Errore nell'esecuzione della funzione AI:", error);
        }
      }

      // Verifica lista cimiteri solo se non è stata trovata una funzione AI specifica
      if (!matchedFunction) {
        const listaCimiteriRegex = /mostra(mi)?\s+(la\s+)?lista\s+(dei\s+)?cimiteri/i;
        if (listaCimiteriRegex.test(normalizedQuery)) {
          const cimiteri = await getAllCimiteri();
          setMessages(prev => [...prev, { 
            type: 'response', 
            content: 'Ecco la lista dei cimiteri disponibili:',
            data: {
              type: 'cimiteri',
              cimiteri
            },
            timestamp: new Date()
          }]);
          setQuery("");
          setIsProcessing(false);
          setTimeout(scrollToBottom, 100);
          return;
        }
      }

      const aiProvider = localStorage.getItem('ai_provider') || 'groq';
      const aiModel = localStorage.getItem('ai_model') || 'mixtral-8x7b-32768';
      
      let response;
      
      if (finalQuery.toLowerCase().startsWith("/test-model")) {
        response = await processTestQuery(aiProvider, aiModel);
      } else {
        const requestBody: QueryRequest = {
          query: finalQuery.trim(),
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
        setMessages(prev => [...prev, { 
          type: 'response', 
          content: response.text || '',
          data: response.data
        }]);
        
        if (response.error) {
          toast.error(response.error, { duration: 2000 });
        }
      }
      
      setQuery("");
      
    } catch (error) {
      console.error("Errore dettagliato:", error);
      toast.error("Errore durante l'elaborazione della richiesta. " + (error as Error).message, {
        duration: 2000
      });
    } finally {
      setIsProcessing(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const toggleWebSearch = () => {
    setWebSearchEnabled(!webSearchEnabled);
    toast.success(
      !webSearchEnabled 
        ? "Modalità Internet attivata" 
        : "Modalità Database attivata",
      { duration: 2000 }
    );
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
    toggleWebSearch
  };
};
