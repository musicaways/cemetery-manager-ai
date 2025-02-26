
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
      // Normalizza la query e rimuovi spazi extra
      const normalizedQuery = finalQuery.toLowerCase().trim().replace(/\s+/g, ' ');
      console.log("Query normalizzata:", normalizedQuery);

      // Lista esatta delle frasi trigger per la lista cimiteri
      const EXACT_CIMITERI_TRIGGERS = [
        "mostra la lista dei cimiteri",
        "mostrami la lista dei cimiteri",
        "lista cimiteri",
        "lista dei cimiteri",
        "visualizza lista cimiteri",
        "visualizza la lista dei cimiteri",
        "elenco cimiteri",
        "elenco dei cimiteri"
      ].map(trigger => trigger.toLowerCase().trim().replace(/\s+/g, ' '));

      console.log("Confronto con triggers:", EXACT_CIMITERI_TRIGGERS);

      // Verifica match ESATTO per la lista cimiteri
      const isExactMatch = EXACT_CIMITERI_TRIGGERS.includes(normalizedQuery);
      console.log("È un match esatto?", isExactMatch);

      if (isExactMatch) {
        console.log("Esecuzione funzione lista cimiteri");
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

      // Verifica match esatto per le altre funzioni AI
      const aiFunctions = await getActiveFunctions();
      const matchedFunction = findMatchingFunction(normalizedQuery, aiFunctions);

      if (matchedFunction) {
        console.log("Funzione AI trovata:", matchedFunction);
        // Procedi con l'esecuzione della funzione AI...
      }

      // Verifica richiesta specifica di un cimitero
      const EXACT_SHOW_CIMITERO_TRIGGERS = [
        "mostra il cimitero di",
        "mostrami il cimitero di",
        "cerca il cimitero di",
        "trovami il cimitero di"
      ].map(trigger => trigger.toLowerCase().trim().replace(/\s+/g, ' '));

      const matchedTrigger = EXACT_SHOW_CIMITERO_TRIGGERS.find(trigger => 
        normalizedQuery.startsWith(trigger)
      );

      if (matchedTrigger) {
        const nomeCimitero = normalizedQuery.slice(matchedTrigger.length).trim();
        console.log("Ricerca cimitero:", nomeCimitero);
        const cimitero = await findCimiteroByName(nomeCimitero);

        if (cimitero) {
          setMessages(prev => [...prev, { 
            type: 'response', 
            content: `Ho trovato il cimitero "${cimitero.Descrizione}"`,
            data: {
              type: 'cimitero',
              cimitero
            },
            timestamp: new Date()
          }]);
        } else {
          setMessages(prev => [...prev, { 
            type: 'response', 
            content: `Non ho trovato nessun cimitero con il nome "${nomeCimitero}".`,
            timestamp: new Date()
          }]);
        }
        setQuery("");
        setIsProcessing(false);
        setTimeout(scrollToBottom, 100);
        return;
      }

      // Se non è un comando specifico, procedi con la richiesta generica
      const aiProvider = localStorage.getItem('ai_provider') || 'groq';
      const aiModel = localStorage.getItem('ai_model') || 'mixtral-8x7b-32768';
      
      if (finalQuery.toLowerCase().startsWith("/test-model")) {
        const response = await processTestQuery(aiProvider, aiModel);
        if (response) {
          setMessages(prev => [...prev, { 
            type: 'response', 
            content: response.text || '',
            data: response.data
          }]);
        }
      } else {
        const requestBody: QueryRequest = {
          query: finalQuery.trim(),
          queryType: webSearchEnabled ? 'web' : 'database',
          aiProvider,
          aiModel,
          isTest: false,
          allowGenericResponse: true
        };

        console.log("Invio richiesta generica:", requestBody);
        
        const { data: response, error } = await supabase.functions.invoke<AIResponse>('process-query', {
          body: requestBody
        });

        if (error) throw error;

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
