
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CimiteriGrid } from "./components/CimiteriGrid";
import { SearchInput } from "./components/SearchInput";
import { Breadcrumb } from "./components/Breadcrumb";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { useCimiteri } from "./hooks/useCimiteri";
import { toast } from "sonner";
import { useOfflineCimiteri } from "./hooks/useOfflineCimiteri";
import { useOnlineStatus } from "@/hooks/chat/useOnlineStatus";
import { useSearch } from "./hooks/useSearch";
import { Layout } from "@/components/Layout";

export const Cimiteri = () => {
  const navigate = useNavigate();
  const { isOnline } = useOnlineStatus();
  const { cimiteri, isLoading, error } = useCimiteri();
  const { searchTerm, setSearchTerm, filteredItems } = useSearch(cimiteri || []);
  const { saveCimiteriOffline } = useOfflineCimiteri();
  const [saving, setSaving] = useState(false);

  // Gestione errori
  useEffect(() => {
    if (error) {
      toast.error("Errore", { description: "Impossibile caricare i cimiteri" });
    }
  }, [error]);

  // Sincronizzazione offline
  const handleSync = async () => {
    if (!cimiteri?.length) return;
    
    setSaving(true);
    try {
      await saveCimiteriOffline(cimiteri);
      toast.success("Sincronizzazione completata", { 
        description: `Sincronizzati ${cimiteri.length} cimiteri per l'uso offline` 
      });
    } catch (e) {
      console.error("Errore durante la sincronizzazione:", e);
      toast.error("Errore di sincronizzazione", { 
        description: "Impossibile salvare i dati offline" 
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="p-4">
          <Breadcrumb items={[{ label: "Home", path: "/" }, { label: "Cimiteri" }]} />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4 mb-6">
            <h1 className="text-2xl font-bold">Cimiteri</h1>
            <div className="flex items-center gap-2">
              {!isOnline && <OfflineIndicator />}
              
              <SearchInput 
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Cerca cimitero..." 
                className="w-full md:w-64"
              />
              
              {isOnline && (
                <button
                  onClick={handleSync}
                  disabled={saving || !cimiteri?.length}
                  className="btn-secondary text-xs px-3 py-2"
                >
                  {saving ? "Sincronizzazione..." : "Sincronizza Offline"}
                </button>
              )}
            </div>
          </div>
          
          <CimiteriGrid 
            cimiteri={filteredItems} 
            isLoading={isLoading}
            onSelect={(id) => navigate(`/cimiteri/${id}`)}
          />
        </div>
      </div>
    </Layout>
  );
};
