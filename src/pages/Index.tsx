
import { useState } from "react";
import { Search, Database, User, Settings, Info } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { AIResponse } from "@/utils/types";
import { AISettings } from "@/components/AISettings";
import { ResultsList } from "@/components/ResultsList";
import { SuggestedQuestions } from "@/components/SuggestedQuestions";

const Index = () => {
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
    <div className="min-h-screen bg-[#121212] text-gray-100">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Assistente Cimiteriale AI
            </h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                <User className="w-5 h-5" />
              </button>
              <button 
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                <Info className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center space-x-2 p-4 bg-gray-800/50 rounded-lg border border-gray-700 focus-within:border-blue-500 backdrop-blur-sm transition-all duration-300">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Chiedimi quello che vuoi sapere sul cimitero..."
                className="flex-1 bg-transparent outline-none placeholder-gray-400 text-gray-100"
                disabled={isProcessing}
              />
              {isProcessing ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent" />
              ) : (
                <Database className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </form>

          {!response && !isProcessing && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-100">Domande Suggerite</h2>
              <SuggestedQuestions onSelect={setQuery} />
            </div>
          )}

          {response && (
            <div className="space-y-6">
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
        </div>
      </main>

      <AISettings 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default Index;
