
import { useState } from "react";
import { Search, Database, User, Settings, Info } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { AIResponse } from "@/utils/types";
import { AISettings } from "@/components/AISettings";

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
          toast.success("Ricerca completata con successo");
        }
      }
      
    } catch (error) {
      toast.error("Errore durante l'elaborazione della richiesta");
      console.error("Errore:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <header className="border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Assistente Cimiteriale AI</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-700 rounded-full">
                <User className="w-5 h-5" />
              </button>
              <button 
                className="p-2 hover:bg-gray-700 rounded-full"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-700 rounded-full">
                <Info className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center space-x-2 p-4 bg-gray-800 rounded-lg border border-gray-700 focus-within:border-blue-500 transition-colors">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Chiedimi quello che vuoi sapere sul cimitero..."
                className="flex-1 bg-transparent outline-none placeholder-gray-400"
                disabled={isProcessing}
              />
              <Database className="w-5 h-5 text-gray-400" />
            </div>
          </form>

          {response && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Risposta dell'Assistente</h2>
              <div className="prose prose-invert">
                <p className="text-gray-300 whitespace-pre-wrap">{response.text}</p>
              </div>
              {response.data && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Risultati della Ricerca</h3>
                  <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors"
              onClick={() => setQuery("Mostrami tutti i cimiteri")}
            >
              <h3 className="text-lg font-semibold mb-2">Lista Cimiteri</h3>
              <p className="text-gray-400">Visualizza tutti i cimiteri disponibili</p>
            </button>
            <button
              className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors"
              onClick={() => setQuery("Quanti defunti sono registrati in totale?")}
            >
              <h3 className="text-lg font-semibold mb-2">Statistiche Generali</h3>
              <p className="text-gray-400">Visualizza le statistiche complessive</p>
            </button>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Esempi di Domande</h2>
            <p className="text-gray-400 mb-4">Clicca su una domanda per provare!</p>
            <ul className="space-y-3">
              <li 
                className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                onClick={() => setQuery("Mostrami tutti i defunti nel Blocco A")}
              >
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-gray-300">"Mostrami tutti i defunti nel Blocco A"</span>
              </li>
              <li 
                className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                onClick={() => setQuery("Quanti loculi liberi ci sono nel Settore 1?")}
              >
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-gray-300">"Quanti loculi liberi ci sono nel Settore 1?"</span>
              </li>
              <li 
                className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                onClick={() => setQuery('Trova tutti i defunti con cognome "Rossi"')}
              >
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="text-gray-300">"Trova tutti i defunti con cognome 'Rossi'"</span>
              </li>
            </ul>
          </div>
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
