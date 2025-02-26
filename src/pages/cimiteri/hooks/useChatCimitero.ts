
import { supabase } from "@/integrations/supabase/client";
import type { Cimitero } from "../types";

export const useChatCimitero = () => {
  const findCimiteroByName = async (name: string) => {
    try {
      const { data: cimitero, error } = await supabase
        .from('Cimitero')
        .select(`
          *,
          settori:Settore!Settore_IdCimitero_fkey(
            Id,
            Codice,
            Descrizione,
            blocchi:Blocco!Blocco_IdSettore_fkey(
              Id,
              Codice,
              Descrizione,
              NumeroFile,
              NumeroLoculi
            )
          ),
          foto:CimiteroFoto(*),
          documenti:CimiteroDocumenti(*),
          mappe:CimiteroMappe(*)
        `)
        .ilike('Descrizione', `%${name}%`)
        .maybeSingle();

      if (error) throw error;
      return cimitero as Cimitero;
    } catch (error) {
      console.error('Error finding cimitero:', error);
      throw error;
    }
  };

  const getAllCimiteri = async () => {
    try {
      const { data: cimiteri, error } = await supabase
        .from('Cimitero')
        .select(`
          *,
          settori:Settore!Settore_IdCimitero_fkey(
            Id,
            Codice,
            Descrizione,
            blocchi:Blocco!Blocco_IdSettore_fkey(
              Id,
              Codice,
              Descrizione,
              NumeroFile,
              NumeroLoculi
            )
          ),
          foto:CimiteroFoto(*),
          documenti:CimiteroDocumenti(*),
          mappe:CimiteroMappe(*)
        `)
        .order('Descrizione');

      if (error) throw error;
      return cimiteri as Cimitero[];
    } catch (error) {
      console.error('Error fetching cimiteri:', error);
      throw error;
    }
  };

  return {
    findCimiteroByName,
    getAllCimiteri
  };
};
