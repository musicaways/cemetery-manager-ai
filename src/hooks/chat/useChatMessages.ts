
import { useState, useRef } from "react";
import type { Message, ChatMessage } from "./types";

export const useChatMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSearch = (searchText: string) => {
    if (!searchText) return;
    
    const elements = document.querySelectorAll('[data-message-index]');
    elements.forEach(el => {
      if (el.textContent?.toLowerCase().includes(searchText.toLowerCase())) {
        el.classList.add('search-highlight');
      } else {
        el.classList.remove('search-highlight');
      }
    });
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const updateLastMessage = (update: Partial<Message>) => {
    setMessages(prev => {
      const newMessages = [...prev];
      if (newMessages.length > 0) {
        const lastIndex = newMessages.length - 1;
        newMessages[lastIndex] = {
          ...newMessages[lastIndex],
          ...update
        };
      }
      return newMessages;
    });
  };

  return {
    messages,
    setMessages,
    messagesEndRef,
    scrollAreaRef,
    handleSearch,
    scrollToBottom,
    addMessage,
    updateLastMessage
  };
};
