
import { useState, useRef } from "react";
import { Search, Database, User, Settings, Info, Plus, Mic, ArrowLeft } from "lucide-react";
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
        } else {
          toast.success("Ricerca completata");
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

  const determineResultType = (query: string) => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('cimiter')) return 'cemetery';
    if (lowerQuery.includes('blocc')) return 'block';
    if (lowerQuery.includes('defunt')) return 'deceased';
    return 'cemetery';
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C] text-gray-100">
      <header className="border-b border-[#2A2F3C]/40 bg-[#1A1F2C]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-[#9b87f5] hover:text-[#7E69AB]"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-base font-semibold text-gray-100">Assistente Cimiteriale</h1>
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

      <main className="container mx-auto px-4 py-6 mb-24">
        <ScrollArea className="h-[calc(100vh-12rem)] rounded-lg">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 && !isProcessing && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto bg-gradient-to-br from-[#9b87f5] to-[#6E59A5] rounded-xl flex items-center justify-center">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold">Come posso aiutarti?</h2>
                </div>
                <SuggestedQuestions onSelect={(q) => handleSubmit(undefined, q)} />
              </div>
            )}

            {messages.map((message, index) => (
              <div key={index} className={`animate-fade-in flex ${message.type === 'query' ? 'justify-end' : 'justify-start'}`}>
                <div className={`${message.type === 'query' ? 'max-w-[60%] ml-8' : 'max-w-[85%] mr-8'}`}>
                  {message.type === 'query' && (
                    <div className="bg-[#9b87f5]/20 rounded-2xl rounded-tr-sm p-4 border border-[#9b87f5]/30 backdrop-blur-sm">
                      <p className="text-[#D6BCFA]">{message.content}</p>
                    </div>
                  )}
                  {message.type === 'response' && (
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#9b87f5] to-[#6E59A5] flex items-center justify-center flex-shrink-0">
                          <Database className="w-4 h-4 text-white" />
                        </div>
                        {message.content && !message.content.includes('```sql') && (
                          <div className="bg-[#2A2F3C]/80 rounded-2xl rounded-tl-sm p-4 border border-[#3A3F4C]/50 backdrop-blur-sm shadow-lg flex-1">
                            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          </div>
                        )}
                      </div>
                      {message.data && (
                        <div className="bg-[#2A2F3C]/80 rounded-lg p-6 border border-[#3A3F4C]/50 backdrop-blur-sm shadow-lg ml-11">
                          <h3 className="text-xl font-semibold mb-6 text-gray-100">Risultati</h3>
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
                  <Database className="w-4 h-4 text-white" />
                </div>
                <div className="bg-[#2A2F3C]/80 rounded-2xl rounded-tl-sm p-4 border border-[#3A3F4C]/50 backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[#9b87f5] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-[#9b87f5] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-[#9b87f5] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-[#1A1F2C]/95 border-t border-[#2A2F3C]/40 backdrop-blur-xl p-4">
        <div className="max-w-3xl mx-auto flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#8E9196] hover:text-[#9b87f5]"
            onClick={() => setIsMediaUploadOpen(true)}
          >
            <Plus className="h-5 w-5" />
          </Button>
          
          <div className="flex-1">
            <form onSubmit={handleSubmit}>
              <div className="flex items-center space-x-2 p-2 bg-[#2A2F3C]/50 rounded-lg border border-[#3A3F4C]/50">
                <TextareaAutosize
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Chiedimi quello che vuoi sapere..."
                  className="flex-1 bg-transparent outline-none placeholder-[#8E9196] text-gray-100 resize-none min-h-[40px] max-h-[200px] py-2"
                  disabled={isProcessing}
                  maxRows={6}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
                {query.trim() && (
                  <Button type="submit" size="sm" className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white">
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
