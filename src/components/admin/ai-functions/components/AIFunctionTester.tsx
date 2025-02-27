
import { useState } from "react";
import { useAIFunctions } from "@/hooks/chat/useAIFunctions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AIFunction } from "@/components/admin/ai-functions/types";

interface AIFunctionTesterProps {
  func: AIFunction;
}

export const AIFunctionTester = ({ func }: AIFunctionTesterProps) => {
  const [testQuery, setTestQuery] = useState("");
  const [exactMatchResult, setExactMatchResult] = useState<boolean | null>(null);
  const [fuzzyMatchResult, setFuzzyMatchResult] = useState<{ matched: boolean; score: number; matchedPhrase?: string } | null>(null);
  
  const { exactMatchTriggerPhrases, matchTriggerPhrases } = useAIFunctions();
  
  const testExactMatch = () => {
    const normalizedQuery = testQuery.toLowerCase().trim();
    const matched = exactMatchTriggerPhrases(normalizedQuery, func.trigger_phrases);
    setExactMatchResult(matched);
  };
  
  const testFuzzyMatch = () => {
    const normalizedQuery = testQuery.toLowerCase().trim();
    const result = matchTriggerPhrases(normalizedQuery, func.trigger_phrases);
    setFuzzyMatchResult(result);
  };
  
  return (
    <Card className="mt-4 bg-[#1A1F2C] border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Test Trigger per "{func.name}"</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex gap-2">
              <Input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                placeholder="Inserisci una frase di test..."
                className="flex-1 bg-[#2A2F3C] border-gray-700 text-white"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={testExactMatch}
                  variant="outline"
                  className="border-[var(--primary-color)] text-[var(--primary-color)]"
                >
                  Test Esatto
                </Button>
                <Button 
                  onClick={testFuzzyMatch}
                  variant="outline"
                  className="border-[var(--primary-color)] text-[var(--primary-color)]"
                >
                  Test Fuzzy
                </Button>
              </div>
            </div>
          </div>
          
          {exactMatchResult !== null && (
            <div className="p-3 rounded bg-[#2A2F3C]">
              <h4 className="font-medium mb-2">Risultato Match Esatto:</h4>
              <Badge className={exactMatchResult ? "bg-green-600" : "bg-red-600"}>
                {exactMatchResult ? "Attivato" : "Non Attivato"}
              </Badge>
            </div>
          )}
          
          {fuzzyMatchResult !== null && (
            <div className="p-3 rounded bg-[#2A2F3C]">
              <h4 className="font-medium mb-2">Risultato Match Fuzzy:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span>Stato:</span>
                  <Badge className={fuzzyMatchResult.matched ? "bg-green-600" : "bg-red-600"}>
                    {fuzzyMatchResult.matched ? "Attivato" : "Non Attivato"}
                  </Badge>
                </div>
                <div>
                  <span>Punteggio: </span>
                  <span className="font-medium">{(fuzzyMatchResult.score * 100).toFixed(1)}%</span>
                </div>
                {fuzzyMatchResult.matched && fuzzyMatchResult.matchedPhrase && (
                  <div>
                    <span>Frase trigger: </span>
                    <span className="font-medium">"{fuzzyMatchResult.matchedPhrase}"</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="p-3 rounded bg-[#2A2F3C]">
            <h4 className="font-medium mb-2">Frasi Trigger Configurate:</h4>
            <div className="flex flex-wrap gap-2">
              {func.trigger_phrases.map((phrase, index) => (
                <Badge key={index} variant="outline" className="bg-[var(--primary-color)]/20 text-[var(--primary-color)]">
                  {phrase}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
