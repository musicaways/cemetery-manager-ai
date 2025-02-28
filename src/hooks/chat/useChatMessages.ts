
import { useState, useRef, useCallback } from "react";
import { Message } from "./types";

export const useChatMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  
  // Ottimizza lo stato immutabile per prevenire re-render non necessari
  const addMessage = useCallback((message: Message) => {
    setMessages(prevMessages => {
      // Se già esiste un messaggio identico, non aggiungerlo di nuovo
      if (prevMessages.some(msg => 
          msg.type === message.type && 
          msg.role === message.role && 
          msg.content === message.content)) {
        return prevMessages;
      }
      
      // Aggiungi il nuovo messaggio
      return [...prevMessages, message];
    });
  }, []);
  
  // Aggiorna l'ultimo messaggio nella conversazione
  const updateLastMessage = useCallback((update: Partial<Message>) => {
    setMessages(prevMessages => {
      if (prevMessages.length === 0) return prevMessages;
      
      // Crea una nuova array con tutti i messaggi tranne l'ultimo
      const allButLast = prevMessages.slice(0, -1);
      // Ottieni l'ultimo messaggio
      const lastMessage = prevMessages[prevMessages.length - 1];
      
      // Crea un nuovo oggetto combinando l'ultimo messaggio con l'aggiornamento
      const updatedMessage = { ...lastMessage, ...update };
      
      // Restituisci una nuova array con tutti i messaggi tranne l'ultimo, più quello aggiornato
      return [...allButLast, updatedMessage];
    });
  }, []);
  
  // Funzione per scorrere alla fine dei messaggi
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      // Utilizza requestAnimationFrame per fare lo scrolling nel prossimo frame di rendering
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    } else if (scrollAreaRef.current) {
      // Fallback: se il messagesEndRef non è presente, scorri l'area di scroll
      requestAnimationFrame(() => {
        const scrollElement = scrollAreaRef.current;
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight;
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
