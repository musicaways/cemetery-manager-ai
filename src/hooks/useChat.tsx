import { useState, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useChatCimitero } from "@/pages/cimiteri/hooks/useChatCimitero";
import type { AIResponse, QueryRequest } from "@/utils/types";
import type { Cimitero } from "@/pages/cimiteri/types";

interface ChatMessage {
  type: 'query' | 'response';
  content: string;
  data?: any;
}

export const useChat = () => {
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [selectedCimitero, setSelectedCimitero] = useState<Cimitero | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { findCimiteroByName } = useChatCimitero();

  const handleSearch = (searchText: string) => {
    if (!searchText.trim()) return;
    
    const foundElement = messages.findIndex(message => 
      message.content.toLowerCase().includes(searchText.toLowerCase())
    );

    if (foundElement !== -1) {
      const element = document.querySelector(`[data-message-index="${foundElement}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        element.classList.add("bg-[#9b87f5]/10");
        setTimeout(() => {
          element.classList.remove("bg-[#9b87f5]/10");
        }, 2000);
      }
    } else {
      toast.error("Nessun risultato trovato");
    }
  };

  const processTestQuery = async (aiProvider: string, aiModel: string) => {
    try {
      const requestBody: QueryRequest = {
        query: "Chi sei?",
        queryType: 'test',
        aiProvider,
        aiModel,
        isTest: true
      };

      const { data, error } = await supabase.functions.invoke<AIResponse>('process-query', {
        body: requestBody
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Errore nel test:", error);
      throw error;
    }
  };

  const handleSubmit = async (e?: React.FormEvent, submittedQuery?: string) => {
    e?.preventDefault();
    const finalQuery = submittedQuery || query;
    if (!finalQuery.trim()) return;
    
    setIsProcessing(true);
    setMessages(prev => [...prev, { type: 'query', content: finalQuery }]);

    try {
      const cimiteroRegex = /mostra(mi)?\s+(il\s+)?cimitero\s+(?:di\s+)?(.+)/i;
      const cimiteroMatch = finalQuery.match(cimiteroRegex);

      if (cimiteroMatch) {
        const nomeCimitero = cimiteroMatch[3];
        const cimitero = await findCimiteroByName(nomeCimitero);

        if (cimitero) {
          setSelectedCimitero(cimitero);
          setMessages(prev => [...prev, { 
            type: 'response', 
            content: `Ho trovato il cimitero "${cimitero.Descrizione}". Mostro i dettagli.`
          }]);
        } else {
          setMessages(prev => [...prev, { 
            type: 'response', 
            content: `Non ho trovato nessun cimitero con il nome "${nomeCimitero}".`
          }]);
        }
        setQuery("");
        setIsProcessing(false);
        setTimeout(scrollToBottom, 100);
        return;
      }

      const aiProvider = localStorage.getItem('ai_provider') || 'groq';
      const aiModel = localStorage.getItem('ai_model') || 'mixtral-8x7b-32768';
      
      let response;
      
      if (finalQuery.startsWith("/test-model")) {
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
