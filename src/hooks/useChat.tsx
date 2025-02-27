
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
      const normalizedQuery = finalQuery.toLowerCase().trim();
      
      // Lista esatta delle frasi che devono attivare la funzione "Lista cimiteri"
      const listaCimiteriExactPhrases = [
        "mostrami tutti i cimiteri",
        "mostrami la lista dei cimiteri",
        "mostrami la lista di tutti i cimiteri",
        "mostra tutti i cimiteri",
        "mostra la lista dei cimiteri",
        "mostra la lista di tutti i cimiteri",
        "visualizza i cimiteri",
        "visualizza tutti i cimiteri",
        "fammi vedere i cimiteri",
        "fammi vedere tutti i cimiteri",
        "vedi i cimiteri",
        "vedi tutti i cimiteri",
        "lista dei cimiteri",
        "lista di tutti i cimiteri",
        "elenco dei cimiteri",
        "elenco di tutti i cimiteri"
      ];
      
      // Verifica diretta per la funzione "Lista cimiteri" prima di qualsiasi altra cosa
      console.log(`Query normalizzata: "${normalizedQuery}"`);
      const isListaCimiteriExactMatch = listaCimiteriExactPhrases.includes(normalizedQuery);
      console.log(`È un match esatto per lista cimiteri? ${isListaCimiteriExactMatch}`);
      
      if (isListaCimiteriExactMatch) {
        console.log("MATCH ESATTO trovato per la funzione 'Lista cimiteri'");
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

      // Verifica cimitero specifico con una regex più rigida
      const cimiteroRegex = /^mostra(mi)?\s+(il\s+)?cimitero\s+(?:di\s+)?(.+)$/i;
      const cimiteroMatch = normalizedQuery.match(cimiteroRegex);

      if (cimiteroMatch) {
        const nomeCimitero = cimiteroMatch[3];
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

      // Solo dopo aver verificato i casi speciali, procediamo con il sistema di matching generale
      // Verifica funzioni AI attive
      const aiFunctions = await getActiveFunctions();
      
      // Cerchiamo le corrispondenze utilizzando il sistema generale (esclusa la lista cimiteri che abbiamo già gestito)
      const filteredFunctions = aiFunctions.filter(
        f => f.name.toLowerCase() !== "lista cimiteri" && 
             f.name.toLowerCase() !== "lista dei cimiteri"
      );
      
      const matchResult = findMatchingFunction(normalizedQuery, filteredFunctions);

      if (matchResult) {
        console.log("Funzione AI trovata:", matchResult.function.name);
        console.log("Punteggio di matching:", matchResult.score);
        console.log("Frase trigger:", matchResult.matchedPhrase);
        
        // TODO: implementare l'esecuzione del codice della funzione
        // const result = await executeFunction(matchResult.function, finalQuery);
        // setMessages(prev => [...prev, { 
        //   type: 'response', 
        //   content: result.text || '',
        //   data: result.data
        // }]);
        // setQuery("");
        // setIsProcessing(false);
        // setTimeout(scrollToBottom, 100);
        // return;
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
