
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
      console.log("Funzioni AI attive recuperate:", aiFunctions);
      return aiFunctions;
    } catch (error) {
      console.error("Errore nel recupero delle funzioni AI:", error);
      throw error;
    }
  };

  return { getActiveFunctions };
};
