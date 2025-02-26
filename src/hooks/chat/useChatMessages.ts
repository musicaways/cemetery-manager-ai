
import { useState, useRef } from "react";
import type { ChatMessage } from "./types";
import { toast } from "sonner";

export const useChatMessages = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return {
    messages,
    setMessages,
    messagesEndRef,
    scrollAreaRef,
    handleSearch,
    scrollToBottom
  };
};
