
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Defunto {
  id: string;
  nominativo: string;
  data_nascita: string;
  data_decesso: string;
  eta: number;
  sesso: "M" | "F";
  annotazioni: string | null;
}

export const useDefunti = (loculoId: string | null) => {
  const [defunti, setDefunti] = useState<Defunto[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDefunti = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('defunti')
        .select('*')
        .eq('id_loculo', loculoId)
        .order('data_decesso', { ascending: false });

      if (error) {
        toast.error("Errore nel caricamento dei defunti: " + error.message);
        return;
      }

      const validatedDefunti: Defunto[] = (data || []).map(d => {
        const validSesso = d.sesso === 'M' || d.sesso === 'F' ? d.sesso : 'M';
        
        return {
          id: d.id,
          nominativo: d.nominativo,
          data_nascita: d.data_nascita,
          data_decesso: d.data_decesso,
          eta: d.eta,
          sesso: validSesso,
          annotazioni: d.annotazioni
        };
      });

      setDefunti(validatedDefunti);
    } catch (error: any) {
      toast.error("Errore nel caricamento dei defunti: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loculoId) {
      loadDefunti();
    }
  }, [loculoId]);

  return { defunti, loading };
};

export type { Defunto };
