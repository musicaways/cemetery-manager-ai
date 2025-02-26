
import { supabase } from "@/integrations/supabase/client";
import type { Cimitero } from "../types";

export const useChatCimitero = () => {
  const findCimiteroByName = async (nome: string): Promise<Cimitero | null> => {
    try {
      const { data, error } = await supabase
        .from('Cimitero')
        .select(`
          *,
          settori:Settore(
            *,
            blocchi:Blocco(*)
          ),
          foto:CimiteroFoto(*),
          documenti:CimiteroDocumenti(*),
          mappe:CimiteroMappe(*)
        `)
        .ilike('Descrizione', `%${nome}%`)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Errore nella ricerca del cimitero:", error);
      return null;
    }
  };

  return { findCimiteroByName };
};
