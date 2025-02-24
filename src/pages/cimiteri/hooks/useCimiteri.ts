
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Cimitero } from "../types";

export const useCimiteri = () => {
  const [cimiteri, setCimiteri] = useState<Cimitero[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadCimiteri = async () => {
    try {
      const { data: cimiteriData, error: cimiteriError } = await supabase
        .from("Cimitero")
        .select(`
          *,
          settori:Settore(*),
          foto:CimiteroFoto(*),
          documenti:CimiteroDocumenti(*),
          mappe:CimiteroMappe(*)
        `);

      if (cimiteriError) throw cimiteriError;
      console.log("Loaded cemeteries:", cimiteriData);
      setCimiteri(cimiteriData || []);
      return cimiteriData;
    } catch (error: any) {
      console.error("Error loading cemeteries:", error);
      toast.error("Errore nel caricamento dei cimiteri: " + error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const updateCimitero = async (id: number, data: Partial<Cimitero>) => {
    if (saving) return;

    try {
      setSaving(true);
      console.log("Updating cemetery with ID:", id);
      console.log("Update data:", data);

      // Verifica che i campi numerici siano effettivamente numeri
      const cleanedData = {
        ...data,
        Latitudine: data.Latitudine ? Number(data.Latitudine) : null,
        Longitudine: data.Longitudine ? Number(data.Longitudine) : null
      };

      const { error } = await supabase
        .from("Cimitero")
        .update(cleanedData)
        .eq("Id", id);

      if (error) throw error;

      console.log("Update successful");
      toast.success("Modifiche salvate con successo");
      await loadCimiteri();
      return true;
    } catch (error: any) {
      console.error("Error updating cemetery:", error);
      toast.error("Errore durante il salvataggio: " + error.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadCimiteri();
  }, []);

  return {
    cimiteri,
    loading,
    saving,
    loadCimiteri,
    updateCimitero
  };
};
