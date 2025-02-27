
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

  // Funzione per verificare e gestire la richiesta di lista cimiteri
  const handleListaCimiteriRequest = async (normalizedQuery: string): Promise<boolean> => {
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

    const isListaCimiteriExactMatch = listaCimiteriExactPhrases.includes(normalizedQuery);
    
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
      return true;
    }
    
    return false;
  };

  // Funzione per verificare e gestire la richiesta di dettagli cimitero
  const handleDettagliCimiteroRequest = async (normalizedQuery: string): Promise<boolean> => {
    const cimiteroPatterns = [
      "mostrami il cimitero ",
      "mostra il cimitero ",
      "mostrami cimitero ",
      "mostra cimitero ",
      "apri il cimitero ",
      "apri cimitero ",
      "dettagli cimitero ",
      "informazioni cimitero ",
      "mostra informazioni cimitero ",
      "mostra informazioni sul cimitero ",
      "mostra informazioni del cimitero ",
      "voglio vedere il cimitero ",
      "fammi vedere il cimitero ",
      "visualizza cimitero ",
      "visualizza il cimitero "
    ];

    // Verifica se la query inizia con uno dei pattern
    let matchedPattern = null;
    let nomeCimitero = null;

    for (const pattern of cimiteroPatterns) {
      if (normalizedQuery.startsWith(pattern)) {
        matchedPattern = pattern;
        nomeCimitero = normalizedQuery.substring(pattern.length).trim();
        break;
      }
    }

    if (matchedPattern) {
      if (nomeCimitero && nomeCimitero.length > 0) {
        console.log(`Cercando cimitero con nome: "${nomeCimitero}"`);
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
      } else {
        setMessages(prev => [...prev, { 
          type: 'response', 
          content: `Per favore, specifica quale cimitero desideri visualizzare. Puoi chiedere "mostrami il cimitero [nome]" oppure chiedere "lista dei cimiteri" per vedere tutti i cimiteri disponibili.`,
          timestamp: new Date()
        }]);
      }
      return true;
    }

    return false;
  };

  const handleSubmit = async (e?: React.FormEvent, submittedQuery?: string) => {
    e?.preventDefault();
    const finalQuery = submittedQuery || query;
    if (!finalQuery.trim()) return;
    
    setIsProcessing(true);
    setMessages(prev => [...prev, { type: 'query', content: finalQuery }]);

    try {
      const normalizedQuery = finalQuery.toLowerCase().trim();
      console.log(`Query normalizzata: "${normalizedQuery}"`);

      // Prima verifica la funzione "Lista cimiteri"
      const isListaCimiteriRequest = await handleListaCimiteriRequest(normalizedQuery);
      if (isListaCimiteriRequest) {
        setQuery("");
        setIsProcessing(false);
        setTimeout(scrollToBottom, 100);
        return;
      }

      // Poi verifica la funzione "Dettagli cimitero"
      const isDettagliCimiteroRequest = await handleDettagliCimiteroRequest(normalizedQuery);
      if (isDettagliCimiteroRequest) {
        setQuery("");
        setIsProcessing(false);
        setTimeout(scrollToBottom, 100);
        return;
      }

      // Se nessuna delle funzioni speciali è stata attivata, procedi con la richiesta AI standard
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
