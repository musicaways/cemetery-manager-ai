
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { AIResponse, QueryRequest } from "@/utils/types";
import { AISettings } from "@/components/AISettings";
import { MediaUpload } from "@/components/MediaUpload";
import { Header } from "@/components/Header";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessages } from "@/components/ChatMessages";

interface ChatMessage {
  type: 'query' | 'response';
  content: string;
  data?: any;
}

const Index = () => {
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMediaUploadOpen, setIsMediaUploadOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  let scrollTimeout: NodeJS.Timeout;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e?: React.FormEvent, submittedQuery?: string) => {
    e?.preventDefault();
    const finalQuery = submittedQuery || query;
    if (!finalQuery.trim()) return;
    
    setIsProcessing(true);
    setMessages(prev => [...prev, { type: 'query', content: finalQuery }]);

    try {
      let requestBody: QueryRequest;
      
      if (finalQuery.startsWith("/test-model")) {
        requestBody = {
          query: "Sei un assistente AI. Rispondi brevemente con: 1) Il tuo nome, 2) Il modello che stai usando, 3) Il provider che ti gestisce.",
          queryType: 'test',
          isTest: true,
          aiProvider: localStorage.getItem('ai_provider') || 'gemini',
          aiModel: localStorage.getItem('ai_model') || 'gemini-pro'
        };
      } else {
        // Se la query contiene parole chiave relative ai cimiteri, forza la modalità database
        const cemeteryKeywords = ['cimitero', 'defunto', 'loculo', 'blocco', 'settore'];
        const containsCemeteryKeywords = cemeteryKeywords.some(keyword => 
          finalQuery.toLowerCase().includes(keyword)
        );
        
        const queryType = containsCemeteryKeywords ? 'database' : 'web';
        
        requestBody = {
          query: finalQuery.trim(),
          queryType,
          aiProvider: localStorage.getItem('ai_provider') || 'gemini',
          aiModel: localStorage.getItem('ai_model') || 'gemini-pro'
        };
      }

      console.log("Invio richiesta a Supabase:", requestBody);
      const { data, error } = await supabase.functions.invoke<AIResponse>('process-query', {
        body: requestBody
      });

      console.log("Risposta da Supabase:", { data, error });

      if (error) {
        console.error("Errore Supabase:", error);
        throw error;
      }
      
      if (data) {
        setMessages(prev => [...prev, { 
          type: 'response', 
          content: data.text || '',
          data: data.data
        }]);
        
        if (data.error) {
          toast.error(data.error);
        }
      }
      
      setQuery("");
      
    } catch (error) {
      console.error("Errore dettagliato:", error);
      toast.error("Errore durante l'elaborazione della richiesta");
    } finally {
      setIsProcessing(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  useEffect(() => {
    const scrollArea = scrollAreaRef.current?.querySelector('.scroll-area-viewport');
    if (!scrollArea) return;

    const handleScroll = () => {
      scrollArea.classList.add('scrolling');
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        scrollArea.classList.remove('scrolling');
      }, 1000);
    };

    scrollArea.addEventListener('scroll', handleScroll);
    return () => {
      scrollArea.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--chat-bg)] text-gray-100 overflow-hidden">
      <Header onSettingsClick={() => setIsSettingsOpen(true)} />

      <main className="container mx-auto px-4 py-4 mb-20">
        <ChatMessages
          messages={messages}
          isProcessing={isProcessing}
          onQuestionSelect={(q) => handleSubmit(undefined, q)}
          scrollAreaRef={scrollAreaRef}
          messagesEndRef={messagesEndRef}
        />
      </main>

      <ChatInput
        query={query}
        isProcessing={isProcessing}
        onQueryChange={setQuery}
        onSubmit={handleSubmit}
        onMediaUploadClick={() => setIsMediaUploadOpen(true)}
        onVoiceRecord={(text) => handleSubmit(undefined, text)}
      />

      <MediaUpload 
        isOpen={isMediaUploadOpen}
        onClose={() => setIsMediaUploadOpen(false)}
        onUpload={(url) => handleSubmit(undefined, `Analizza questa immagine: ${url}`)}
      />

      <AISettings 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default Index;
