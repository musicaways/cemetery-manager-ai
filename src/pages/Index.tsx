import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Settings, Info, Plus, Skull } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { AIResponse } from "@/utils/types";
import { AISettings } from "@/components/AISettings";
import { ResultsList } from "@/components/ResultsList";
import { SuggestedQuestions } from "@/components/SuggestedQuestions";
import { MediaUpload } from "@/components/MediaUpload";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import TextareaAutosize from 'react-textarea-autosize';

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
      console.log("Invio richiesta a Supabase:", finalQuery);
      const { data, error } = await supabase.functions.invoke<AIResponse>('process-query', {
        body: { query: finalQuery.trim() }
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

  const testAIModel = async () => {
    const testQuery = "/test-model";
    if (query === testQuery) {
      setIsProcessing(true);
      try {
        const { data, error } = await supabase.functions.invoke<AIResponse>('process-query', {
          body: { 
            query: "Sei un assistente AI. Rispondi brevemente con: 1) Il tuo nome, 2) Il modello che stai usando, 3) Il provider che ti gestisce.",
            isTest: true
          }
        });

        if (error) throw error;
        
        if (data) {
          setMessages(prev => [...prev, { 
            type: 'response', 
            content: data.text || ''
          }]);
        }
      } catch (error) {
        console.error("Errore test modello:", error);
        toast.error("Errore durante il test del modello");
      } finally {
        setIsProcessing(false);
        setQuery("");
        setTimeout(scrollToBottom, 100);
      }
    } else {
      handleSubmit(undefined, query);
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
      <header className="border-b border-[#2A2F3C]/40 bg-[#1A1F2C]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-12">
            <Button
              variant="ghost"
              size="icon"
              className="text-[#9b87f5] hover:text-[#7E69AB] h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 ml-3">
              <h1 className="text-sm font-semibold text-gray-100">Assistente Cimiteriale</h1>
              <p className="text-xs text-[#8E9196]">AI Assistant</p>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSettingsOpen(true)}
                className="h-8 w-8"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 mb-20">
        <ScrollArea 
          ref={scrollAreaRef}
          className="h-[calc(100vh-8.5rem)] rounded-lg"
        >
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 && !isProcessing && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto bg-gradient-to-br from-[#9b87f5] to-[#6E59A5] rounded-xl flex items-center justify-center">
                    <Skull className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold">Come posso aiutarti?</h2>
                  <p className="text-sm text-gray-400">Usa /test-model per verificare il modello AI in uso</p>
                </div>
                <SuggestedQuestions onSelect={(q) => handleSubmit(undefined, q)} />
              </div>
            )}

            {messages.map((message, index) => (
              <div key={index} className={`animate-fade-in flex ${message.type === 'query' ? 'justify-end' : 'justify-start'}`}>
                <div className={`${message.type === 'query' ? 'max-w-[85%] ml-auto' : 'max-w-[85%]'} w-full`}>
                  {message.type === 'query' && (
                    <div className="bg-[var(--primary-color)]/20 rounded-2xl rounded-tr-sm p-3 border border-[var(--primary-color)]/30 backdrop-blur-sm">
                      <p className="text-gray-100">{message.content}</p>
                    </div>
                  )}
                  {message.type === 'response' && (
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-hover)] flex items-center justify-center flex-shrink-0">
                          <Skull className="w-4 h-4 text-white" />
                        </div>
                        {message.content && !message.content.includes('```sql') && (
                          <div className="bg-[#2A2F3C]/80 rounded-2xl rounded-tl-sm p-3 border border-[#3A3F4C]/50 backdrop-blur-sm shadow-lg flex-1">
                            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          </div>
                        )}
                      </div>
                      {message.data && (
                        <div className="bg-[#2A2F3C]/80 rounded-lg p-4 border border-[#3A3F4C]/50 backdrop-blur-sm shadow-lg ml-11">
                          <h3 className="text-lg font-semibold mb-4 text-gray-100">Risultati</h3>
                          <ResultsList 
                            data={message.data}
                            type={determineResultType(message.content)}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#9b87f5] to-[#6E59A5] flex items-center justify-center">
                  <Skull className="w-4 h-4 text-white" />
                </div>
                <div className="bg-[#2A2F3C]/80 rounded-2xl rounded-tl-sm p-3 border border-[#3A3F4C]/50 backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#9b87f5] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-[#9b87f5] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-[#9b87f5] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </ScrollArea>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-[#1A1F2C] border-t border-[#2A2F3C]/40 backdrop-blur-xl p-3">
        <div className="max-w-3xl mx-auto flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#8E9196] hover:text-[#9b87f5] h-8 w-8"
            onClick={() => setIsMediaUploadOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
          
          <div className="flex-1">
            <form onSubmit={(e) => {
              e.preventDefault();
              testAIModel();
            }}>
              <div className="flex items-center space-x-2 p-2 bg-[#2A2F3C]/50 rounded-lg border border-[#3A3F4C]/50">
                <TextareaAutosize
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Chiedimi quello che vuoi sapere... (usa /test-model per verificare il modello)"
                  className="flex-1 bg-transparent outline-none placeholder-[#8E9196] text-gray-100 resize-none min-h-[36px] max-h-[120px] py-1"
                  disabled={isProcessing}
                  maxRows={4}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      testAIModel();
                    }
                  }}
                />
                {query.trim() && (
                  <Button type="submit" size="sm" className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white h-8">
                    Invia
                  </Button>
                )}
              </div>
            </form>
          </div>

          <VoiceRecorder onRecordingComplete={(text) => handleSubmit(undefined, text)} />
        </div>
      </footer>

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
