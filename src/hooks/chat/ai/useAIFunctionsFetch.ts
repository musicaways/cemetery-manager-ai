
import { supabase } from "@/integrations/supabase/client";

export const useAIFunctionsFetch = () => {
  const getActiveFunctions = async () => {
    try {
      console.log("Recupero funzioni AI attive...");
      const { data: aiFunctions, error } = await supabase
        .from('ai_chat_functions')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      // Log dettagliato delle funzioni
      console.log("\n=== FUNZIONI AI ATTIVE ===");
      aiFunctions?.forEach(func => {
        console.log(`\nFunzione: ${func.name}`);
        console.log("Frasi trigger:");
        func.trigger_phrases.forEach((phrase: string) => {
          console.log(`- "${phrase}"`);
        });
      });
      console.log("===========================\n");

      return aiFunctions;
    } catch (error) {
      console.error("Errore nel recupero delle funzioni AI:", error);
      throw error;
    }
  };

  return { getActiveFunctions };
};
