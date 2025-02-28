
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { offlineManager } from "@/lib/offline/offlineManager";
import type { Cimitero } from "../types";

export const useOfflineCimiteri = () => {
  const [cimiteri, setCimiteri] = useState<Cimitero[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Gestione dello stato online/offline
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Carica i cimiteri all'avvio
  useEffect(() => {
    loadCimiteri();
  }, []);

  // Funzione per caricare i cimiteri
  const loadCimiteri = async () => {
    setLoading(true);
    try {
      const data = await offlineManager.getCimiteri();
      setCimiteri(data);
    } catch (error: any) {
      console.error("Error loading cimiteri:", error);
      toast.error("Errore nel caricamento dei cimiteri: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Funzione per aggiornare un cimitero
  const updateCimitero = async (id: number, data: Partial<Cimitero>, coverImage?: File): Promise<boolean> => {
    if (saving) return false;
    
    setSaving(true);
    try {
      console.log("Updating cemetery with ID:", id);
      
      let updateData = { ...data };

      // Gestione dell'upload dell'immagine
      if (coverImage && isOnline) {
        const imageUrl = await uploadCoverImage(coverImage);
        if (imageUrl) {
          updateData.FotoCopertina = imageUrl;
        }
      }

      const cleanedData = {
        ...updateData,
        Latitudine: updateData.Latitudine ? Number(updateData.Latitudine) : null,
        Longitudine: updateData.Longitudine ? Number(updateData.Longitudine) : null
      };

      // Salva i dati (in locale o remoto)
      const success = await offlineManager.saveCimitero(cleanedData, id);
      
      if (success) {
        toast.success("Modifiche salvate con successo");
        await loadCimiteri(); // Ricarica i dati
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error updating cemetery:", error);
      toast.error("Errore durante il salvataggio: " + error.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Funzione per caricare un'immagine di copertina
  const uploadCoverImage = async (file: File): Promise<string | null> => {
    try {
      if (!isOnline) {
        toast.error("Non è possibile caricare immagini in modalità offline");
        return null;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await fetch("/api/upload-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: filePath,
          fileType: file.type,
          bucket: "cemetery-covers"
        }),
      }).then(res => res.json());

      if (uploadError) throw uploadError;

      // Usa il signed URL per caricare il file
      const { url, publicUrl } = data;
      
      await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      return publicUrl;
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error("Errore durante l'upload dell'immagine: " + error.message);
      return null;
    }
  };

  return {
    cimiteri,
    loading,
    saving,
    isOnline,
    loadCimiteri,
    updateCimitero
  };
};
