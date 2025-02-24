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
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  let scrollTimeout: NodeJS.Timeout;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
          isTest: false
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
        webSearchEnabled={webSearchEnabled}
        onWebSearchToggle={() => {
          setWebSearchEnabled(!webSearchEnabled);
          toast.success(
            !webSearchEnabled 
              ? "Modalità Internet attivata" 
              : "Modalità Database attivata",
            { duration: 2000 }
          );
        }}
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
