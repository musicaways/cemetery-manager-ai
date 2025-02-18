
import { useState } from "react";
import { Search, Database, User, Settings, Info } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { AIResponse } from "@/utils/types";

const Index = () => {
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);

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
          toast.success("Query processed successfully");
        }
      }
      
    } catch (error) {
      toast.error("Error processing query");
      console.error("Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Cemetery Manager AI</h1>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-700 rounded-full">
                <User className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-700 rounded-full">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-700 rounded-full">
                <Info className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Command Input */}
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-center space-x-2 p-4 bg-gray-800 rounded-lg border border-gray-700 focus-within:border-blue-500 transition-colors">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything about the cemetery data..."
                className="flex-1 bg-transparent outline-none placeholder-gray-400"
                disabled={isProcessing}
              />
              <Database className="w-5 h-5 text-gray-400" />
            </div>
          </form>

          {/* AI Response */}
          {response && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">AI Assistant Response</h2>
              <div className="prose prose-invert">
                <p className="text-gray-300 whitespace-pre-wrap">{response.text}</p>
              </div>
              {response.data && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Data Results</h3>
                  <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors"
              onClick={() => setQuery("Show me all cemeteries")}
            >
              <h3 className="text-lg font-semibold mb-2">View All Cemeteries</h3>
              <p className="text-gray-400">Browse through all cemetery locations</p>
            </button>
            <button
              className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors"
              onClick={() => setQuery("How many total deceased are registered?")}
            >
              <h3 className="text-lg font-semibold mb-2">Total Statistics</h3>
              <p className="text-gray-400">View overall cemetery statistics</p>
            </button>
          </div>

          {/* Features Preview */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Example Questions</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>"Show me all deceased persons in Blocco A"</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>"How many free loculi are in Settore 1?"</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>"Find all records for deceased named 'Rossi'"</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
