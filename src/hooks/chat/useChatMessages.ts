
import { useState, useRef, useCallback } from "react";
import { Message } from "./types";

export const useChatMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  
  // Ottimizza lo stato immutabile per prevenire re-render non necessari
  const addMessage = useCallback((message: Message) => {
    // Verifica che il messaggio sia valido
    if (!message || typeof message !== 'object') {
      console.error("Formato messaggio non valido:", message);
      return;
    }
    
    // Assicurati che il contenuto sia una stringa
    const validatedMessage = {
      ...message,
      content: typeof message.content === 'string' 
        ? message.content 
        : typeof message.content === 'object'
          ? JSON.stringify(message.content)
          : String(message.content || '')
    };
    
    setMessages(prevMessages => {
      // Se già esiste un messaggio identico, non aggiungerlo di nuovo
      if (prevMessages.some(msg => 
          msg.type === validatedMessage.type && 
          msg.role === validatedMessage.role && 
          msg.content === validatedMessage.content)) {
        return prevMessages;
      }
      
      // Aggiungi il nuovo messaggio
      return [...prevMessages, validatedMessage];
    });
  }, []);
  
  // Aggiorna l'ultimo messaggio nella conversazione
  const updateLastMessage = useCallback((update: Partial<Message>) => {
    setMessages(prevMessages => {
      if (prevMessages.length === 0) return prevMessages;
      
      // Verifica che l'aggiornamento sia valido
      const validatedUpdate = {
        ...update,
        // Assicurati che il contenuto, se presente, sia una stringa
        ...(update.content !== undefined && {
          content: typeof update.content === 'string' 
            ? update.content 
            : typeof update.content === 'object'
              ? JSON.stringify(update.content)
              : String(update.content || '')
        })
      };
      
      // Crea una nuova array con tutti i messaggi tranne l'ultimo
      const allButLast = prevMessages.slice(0, -1);
      // Ottieni l'ultimo messaggio
      const lastMessage = prevMessages[prevMessages.length - 1];
      
      // Crea un nuovo oggetto combinando l'ultimo messaggio con l'aggiornamento
      const updatedMessage = { ...lastMessage, ...validatedUpdate };
      
      // Restituisci una nuova array con tutti i messaggi tranne l'ultimo, più quello aggiornato
      return [...allButLast, updatedMessage];
    });
  }, []);
  
  // Funzione per scorrere alla fine dei messaggi
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      // Utilizza requestAnimationFrame per fare lo scrolling nel prossimo frame di rendering
      requestAnimationFrame(() => {
        try {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (scrollError) {
          console.error("Errore durante lo scroll:", scrollError);
          // Fallback: scorrimento senza animazione
          messagesEndRef.current?.scrollIntoView();
        }
      });
    } else if (scrollAreaRef.current) {
      // Fallback: se il messagesEndRef non è presente, scorri l'area di scroll
      requestAnimationFrame(() => {
        try {
          const scrollElement = scrollAreaRef.current;
          if (scrollElement) {
            scrollElement.scrollTop = scrollElement.scrollHeight;
          }
        } catch (scrollError) {
          console.error("Errore durante lo scroll fallback:", scrollError);
        }
      });
    }
  }, []);
  
  return {
    messages,
    messagesEndRef,
    scrollAreaRef,
    addMessage,
    updateLastMessage,
    scrollToBottom
  };
};
