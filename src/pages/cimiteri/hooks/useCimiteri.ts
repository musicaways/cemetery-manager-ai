
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
        `)
        .order('Descrizione', { ascending: true });

      if (cimiteriError) throw cimiteriError;
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

  const uploadCoverImage = async (file: File): Promise<string | null> => {
    try {
      // Sanificare il nome del file
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('cemetery-covers')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Ottenere l'URL pubblico del file
      const { data: { publicUrl } } = supabase.storage
        .from('cemetery-covers')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error("Errore durante l'upload dell'immagine: " + error.message);
      return null;
    }
  };

  const updateCimitero = async (id: number, data: Partial<Cimitero>, coverImage?: File) => {
    if (saving) return;

    try {
      setSaving(true);
      console.log("Updating cemetery with ID:", id);
      
      let updateData = { ...data };

      // Se c'è una nuova immagine di copertina, carichiamola prima
      if (coverImage) {
        const imageUrl = await uploadCoverImage(coverImage);
        if (imageUrl) {
          updateData.FotoCopertina = imageUrl;
        }
      }

      // Verifica che i campi numerici siano effettivamente numeri
      const cleanedData = {
        ...updateData,
        Latitudine: updateData.Latitudine ? Number(updateData.Latitudine) : null,
        Longitudine: updateData.Longitudine ? Number(updateData.Longitudine) : null
      };

      console.log("Update data:", cleanedData);

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
