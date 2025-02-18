
import { useState } from "react";
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

const Index = () => {
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMediaUploadOpen, setIsMediaUploadOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsProcessing(true);
    setResponse(null);
    
    try {
      const { data, error } = await supabase.functions.invoke<AIResponse>('process-query', {
        body: { query: query.trim() }
      });

      if (error) throw error;
      
      if (data) {
        setResponse(data);
        if (data.error) {
          toast.error(data.error);
        } else {
          toast.success("Ricerca completata");
        }
      }
      
    } catch (error) {
      toast.error("Errore durante l'elaborazione della richiesta");
      console.error("Errore:", error);
    } finally {
      setIsProcessing(false);
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
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      <header className="border-b border-gray-800 bg-[#141414] sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-orange-500"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Assistente Cimiteriale</h1>
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

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {!response && !isProcessing && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-semibold">Come posso aiutarti?</h2>
              </div>
              <SuggestedQuestions onSelect={setQuery} />
            </div>
          )}

          {response && !isProcessing && (
            <div className="space-y-6 animate-fade-in">
              {response.text && !response.text.includes('```sql') && (
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 backdrop-blur-sm">
                  <p className="text-gray-300 leading-relaxed">{response.text}</p>
                </div>
              )}
              
              {response.data && (
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 backdrop-blur-sm">
                  <h3 className="text-xl font-semibold mb-6 text-gray-100">Risultati</h3>
                  <ResultsList 
                    data={response.data} 
                    type={determineResultType(query)}
                  />
                </div>
              )}
            </div>
          )}

          {isProcessing && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Elaborazione in corso...</p>
            </div>
          )}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-[#141414] border-t border-gray-800 p-4">
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
              <div className="flex items-center space-x-2 p-2 bg-gray-800 rounded-lg">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Chiedimi quello che vuoi sapere..."
                  className="flex-1 bg-transparent outline-none placeholder-gray-400"
                  disabled={isProcessing}
                />
                {query.trim() && (
                  <Button type="submit" size="sm" className="bg-orange-500 hover:bg-orange-600">
                    Invia
                  </Button>
                )}
              </div>
            </form>
          </div>

          <VoiceRecorder onRecordingComplete={setQuery} />
        </div>
      </footer>

      <MediaUpload 
        isOpen={isMediaUploadOpen}
        onClose={() => setIsMediaUploadOpen(false)}
        onUpload={(url) => setQuery(`Analizza questa immagine: ${url}`)}
      />

      <AISettings 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default Index;
