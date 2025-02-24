
import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MediaUpload } from "@/components/MediaUpload";
import { CimiteroCard } from "./components/CimiteroCard";
import { CimiteroDetails } from "./components/CimiteroDetails/CimiteroDetails";
import { Cimitero } from "./types";

export const Cimiteri = () => {
  const [cimiteri, setCimiteri] = useState<Cimitero[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCimitero, setSelectedCimitero] = useState<Cimitero | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState<Partial<Cimitero>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);

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
      
      // Aggiorna sia la lista che il cimitero selezionato se presente
      setCimiteri(cimiteriData || []);
      if (selectedCimitero) {
        const updatedSelected = cimiteriData?.find(c => c.Id === selectedCimitero.Id) || null;
        setSelectedCimitero(updatedSelected);
      }
    } catch (error: any) {
      toast.error("Errore nel caricamento dei cimiteri: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCimiteri();
  }, []);

  useEffect(() => {
    const handleSearch = (e: CustomEvent<string>) => {
      setSearchTerm(e.detail);
    };
    
    window.addEventListener('global-search', handleSearch as EventListener);
    return () => window.removeEventListener('global-search', handleSearch as EventListener);
  }, []);

  const handleEdit = () => {
    setEditMode(true);
    // Inizializza editedData con i valori attuali del cimitero selezionato
    if (selectedCimitero) {
      setEditedData({
        Descrizione: selectedCimitero.Descrizione,
        Indirizzo: selectedCimitero.Indirizzo,
        Latitudine: selectedCimitero.Latitudine,
        Longitudine: selectedCimitero.Longitudine,
        FotoCopertina: selectedCimitero.FotoCopertina,
      });
    }
  };

  const handleSave = async () => {
    if (!selectedCimitero) return;

    try {
      console.log("Saving changes:", editedData);
      
      const updateData = {
        Descrizione: editedData.Descrizione,
        Indirizzo: editedData.Indirizzo,
        Latitudine: editedData.Latitudine,
        Longitudine: editedData.Longitudine,
        FotoCopertina: editedData.FotoCopertina,
      };

      const { error } = await supabase
        .from("Cimitero")
        .update(updateData)
        .eq("Id", selectedCimitero.Id);

      if (error) throw error;

      toast.success("Modifiche salvate con successo");
      setEditMode(false);
      await loadCimiteri(); // Ricarica i dati dopo il salvataggio
    } catch (error: any) {
      console.error("Error saving changes:", error);
      toast.error("Errore durante il salvataggio: " + error.message);
    }
  };

  const handleInputChange = (field: string, value: string | number | null) => {
    console.log("Updating field:", field, "with value:", value);
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUploadComplete = async (url: string) => {
    if (!selectedCimitero) return;
    
    try {
      const { error } = await supabase
        .from("Cimitero")
        .update({ FotoCopertina: url })
        .eq("Id", selectedCimitero.Id);

      if (error) throw error;

      toast.success("Foto di copertina aggiornata");
      await loadCimiteri(); // Ricarica i dati dopo l'upload
      setIsUploadOpen(false);
    } catch (error: any) {
      toast.error("Errore durante l'aggiornamento della foto: " + error.message);
    }
  };

  const filteredCimiteri = cimiteri.filter(cimitero =>
    cimitero.Descrizione?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cimitero.Codice?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCimiteri.map((cimitero) => (
          <CimiteroCard
            key={cimitero.Id}
            cimitero={cimitero}
            onClick={() => setSelectedCimitero(cimitero)}
          />
        ))}
      </div>

      <Dialog 
        open={!!selectedCimitero} 
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCimitero(null);
            setEditMode(false);
            setEditedData({});
          }
        }}
      >
        <CimiteroDetails
          cimitero={selectedCimitero}
          editMode={editMode}
          editedData={editedData}
          onEdit={handleEdit}
          onSave={handleSave}
          onUpload={() => setIsUploadOpen(true)}
          onInputChange={handleInputChange}
        />
      </Dialog>

      <MediaUpload 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUploadComplete}
      />
    </div>
  );
};

export default Cimiteri;
