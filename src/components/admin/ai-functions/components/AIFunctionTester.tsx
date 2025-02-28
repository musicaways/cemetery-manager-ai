
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAIFunctions } from "@/hooks/chat/useAIFunctions";
import { AIFunction } from "../types";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { isListaCimiteriQuery, debugListaCimiteriMatch } from "@/hooks/chat/utils/cimiteriUtils";

export const AIFunctionTester = ({ func }: { func: AIFunction }) => {
  const [testQuery, setTestQuery] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { processTestQuery, matchTriggerPhrases, exactMatchTriggerPhrases } = useAIFunctions();

  const handleTest = async () => {
    if (!testQuery.trim()) {
      toast.error("Inserisci una query di test");
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      // Test del matching con frasi trigger
      const normalizedQuery = testQuery.toLowerCase().trim();
      const phrases = func.trigger_phrases.map(p => p.trim().toLowerCase());
      
      // Test con match esatto
      const exactMatch = exactMatchTriggerPhrases(normalizedQuery, phrases);
      
      // Test con match parziale
      const partialMatch = matchTriggerPhrases(normalizedQuery, phrases);
      
      // Test con funzione lista cimiteri (se applicabile)
      const isCimiteriListQuery = isListaCimiteriQuery(normalizedQuery);
      const cimiteriDebugMatch = debugListaCimiteriMatch(normalizedQuery);

      // Stampa info sul matching
      let matchInfo = "";
      
      if (func.name.toLowerCase().includes("elenco cimiteri") || 
          func.name.toLowerCase().includes("lista cimiteri")) {
        matchInfo = `
💡 Debug lista cimiteri:
- È riconosciuta come query lista cimiteri: ${isCimiteriListQuery ? "✅ Si" : "❌ No"}
${isCimiteriListQuery ? `- Match trovato: ${cimiteriDebugMatch.matchedTrigger || cimiteriDebugMatch.matchedPattern || "Match generico"}` : ""}

`;
      }
      
      matchInfo += `
📋 Debug matching:
- Match esatto: ${exactMatch ? "✅ Si" : "❌ No"}
- Match parziale: ${partialMatch.matched ? `✅ Si (score: ${partialMatch.score.toFixed(2)})` : "❌ No"}
${partialMatch.matched ? `- Frase matched: "${partialMatch.matchedPhrase}"` : ""}

🧪 Risultato esecuzione:
`;

      // Esegui la funzione
      const testResult = await processTestQuery(func, testQuery);
      setResult(matchInfo + (testResult.text || JSON.stringify(testResult, null, 2)));
    } catch (error) {
      console.error("Errore nel test della funzione:", error);
      setResult(`❌ Errore: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mt-8 p-4 border border-gray-700 rounded-lg bg-gray-800/30">
      <h3 className="text-lg font-medium mb-4">Test Funzione</h3>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="Inserisci una query di test..."
            className="bg-[#2A2F3C] border-gray-700 text-white"
          />
          <Button 
            onClick={handleTest}
            disabled={isProcessing}
            className="bg-[var(--primary-color)] hover:bg-[var(--primary-hover)]"
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Testa"}
          </Button>
        </div>
        
        {result && (
          <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg whitespace-pre-wrap font-mono text-sm overflow-auto max-h-60">
            {result}
          </div>
        )}
      </div>
    </div>
  );
};
