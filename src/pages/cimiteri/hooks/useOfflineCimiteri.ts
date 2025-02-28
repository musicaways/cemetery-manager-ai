
import { useState, useEffect } from "react";
import { Cimitero } from "../types";
import { useOnlineStatus } from "@/hooks/chat/useOnlineStatus";

export const useOfflineCimiteri = () => {
  const [cimiteri, setCimiteri] = useState<Cimitero[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOnline } = useOnlineStatus();

  // Carica i cimiteri da IndexedDB quando siamo offline
  useEffect(() => {
    const loadCimiteriFromIndexedDB = async () => {
      if (!isOnline) {
        setLoading(true);
        try {
          // Usa IndexedDB per caricare i dati
          const openRequest = indexedDB.open("cimiteriDB", 1);
          
          openRequest.onupgradeneeded = () => {
            const db = openRequest.result;
            if (!db.objectStoreNames.contains("cimiteri")) {
              db.createObjectStore("cimiteri", { keyPath: "Id" });
            }
          };
          
          openRequest.onsuccess = () => {
            const db = openRequest.result;
            const transaction = db.transaction("cimiteri", "readonly");
            const store = transaction.objectStore("cimiteri");
            const request = store.getAll();
            
            request.onsuccess = () => {
              setCimiteri(request.result || []);
              setLoading(false);
            };
            
            request.onerror = () => {
              console.error("Errore durante il caricamento dei cimiteri offline");
              setLoading(false);
            };
          };
          
          openRequest.onerror = () => {
            console.error("Errore durante l'apertura del database");
            setLoading(false);
          };
        } catch (error) {
          console.error("Errore durante il caricamento dei cimiteri offline:", error);
          setLoading(false);
        }
      } else {
        // Se siamo online, non carichiamo nulla da IndexedDB
        setLoading(false);
      }
    };
    
    loadCimiteriFromIndexedDB();
  }, [isOnline]);

  // Salva i cimiteri in IndexedDB per l'uso offline
  const saveCimiteri = async (data: Cimitero[]) => {
    try {
      const openRequest = indexedDB.open("cimiteriDB", 1);
      
      openRequest.onupgradeneeded = () => {
        const db = openRequest.result;
        if (!db.objectStoreNames.contains("cimiteri")) {
          db.createObjectStore("cimiteri", { keyPath: "Id" });
        }
      };
      
      openRequest.onsuccess = () => {
        const db = openRequest.result;
        const transaction = db.transaction("cimiteri", "readwrite");
        const store = transaction.objectStore("cimiteri");
        
        // Cancella i dati esistenti
        store.clear();
        
        // Aggiunge i nuovi dati
        data.forEach(item => {
          store.put(item);
        });
        
        transaction.oncomplete = () => {
          console.log("Dati salvati con successo per l'uso offline");
        };
      };
    } catch (error) {
      console.error("Errore durante il salvataggio dei dati offline:", error);
      throw error;
    }
  };

  // Per caricare i cimiteri manualmente
  const loadCimiteri = async () => {
    // Se sei già in modalità offline, questa funzione ricaricherà i dati
    if (!isOnline) {
      setLoading(true);
      try {
        const openRequest = indexedDB.open("cimiteriDB", 1);
        
        openRequest.onsuccess = () => {
          const db = openRequest.result;
          const transaction = db.transaction("cimiteri", "readonly");
          const store = transaction.objectStore("cimiteri");
          const request = store.getAll();
          
          request.onsuccess = () => {
            setCimiteri(request.result || []);
            setLoading(false);
          };
          
          request.onerror = () => {
            console.error("Errore durante il caricamento dei cimiteri offline");
            setLoading(false);
          };
        };
      } catch (error) {
        console.error("Errore durante il caricamento dei cimiteri offline:", error);
        setLoading(false);
      }
    }
  };

  return {
    cimiteri,
    loading,
    isOnline,
    loadCimiteri,
    saveCimiteri,
    updateCimitero: async (id: number, data: Partial<Cimitero>, coverImage?: File) => {
      // Implementa la logica per aggiornare un cimitero in modalità offline
      console.log("Aggiornamento cimitero non supportato in modalità offline");
      return false;
    }
  };
};
