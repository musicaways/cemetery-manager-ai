
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
    
    // Aggiungi la query ai messaggi
    setMessages(prev => [...prev, { type: 'query', content: finalQuery }]);
    
    try {
      const { data, error } = await supabase.functions.invoke<AIResponse>('process-query', {
        body: { query: finalQuery.trim() }
      });

      if (error) throw error;
      
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
      
      // Pulizia del campo di input dopo l'invio
      setQuery("");
      
    } catch (error) {
      toast.error("Errore durante l'elaborazione della richiesta");
      console.error("Errore:", error);
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
    <div className="min-h-screen bg-[#0d0f13] text-gray-100">
      <header className="border-b border-gray-800/40 bg-[#0d0f13]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-blue-400 hover:text-blue-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-100">Assistente Cimiteriale</h1>
              <p className="text-sm text-gray-400">AI Assistant</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
              >
                <Info className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 mb-32">
        <ScrollArea className="h-[calc(100vh-13rem)] rounded-lg">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 && !isProcessing && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold">Come posso aiutarti?</h2>
                </div>
                <SuggestedQuestions onSelect={(q) => handleSubmit(undefined, q)} />
              </div>
            )}

            {messages.map((message, index) => (
              <div key={index} className={`animate-fade-in flex ${message.type === 'query' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${message.type === 'query' ? 'ml-8' : 'mr-8'}`}>
                  {message.type === 'query' && (
                    <div className="bg-blue-500/20 rounded-2xl rounded-tr-sm p-4 border border-blue-500/30 backdrop-blur-sm">
                      <p className="text-blue-100">{message.content}</p>
                    </div>
                  )}
                  {message.type === 'response' && (
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <Database className="w-4 h-4 text-white" />
                        </div>
                        {message.content && !message.content.includes('```sql') && (
                          <div className="bg-gray-800/30 rounded-2xl rounded-tl-sm p-4 border border-gray-700/50 backdrop-blur-sm shadow-lg">
                            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          </div>
                        )}
                      </div>
                      {message.data && (
                        <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700/50 backdrop-blur-sm shadow-lg ml-11">
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
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Database className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-800/30 rounded-2xl rounded-tl-sm p-4 border border-gray-700/50 backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-[#0d0f13]/80 border-t border-gray-800/40 backdrop-blur-xl p-4">
        <div className="max-w-3xl mx-auto flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-gray-300"
            onClick={() => setIsMediaUploadOpen(true)}
          >
            <Plus className="h-5 w-5" />
          </Button>
          
          <div className="flex-1">
            <form onSubmit={handleSubmit}>
              <div className="flex items-center space-x-2 p-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <TextareaAutosize
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Chiedimi quello che vuoi sapere..."
                  className="flex-1 bg-transparent outline-none placeholder-gray-400 text-gray-100 resize-none min-h-[40px] max-h-[200px] py-2"
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
                  <Button type="submit" size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
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
