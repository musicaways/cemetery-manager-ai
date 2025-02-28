
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CimiteriGrid } from "./components/CimiteriGrid";
import { SearchInput } from "@/components/ui/input";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { useCimiteri } from "./hooks/useCimiteri";
import { toast } from "sonner";
import { useOfflineCimiteri } from "./hooks/useOfflineCimiteri";
import { useOnlineStatus } from "@/hooks/chat/useOnlineStatus";
import { useSearch } from "./hooks/useSearch";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

export const Cimiteri = () => {
  const navigate = useNavigate();
  const { isOnline } = useOnlineStatus();
  const { cimiteri, loading: isLoading, saving, updateCimitero } = useCimiteri();
  const { searchTerm } = useSearch();
  const [searchInput, setSearchInput] = useState("");
  const { cimiteri: offlineCimiteri, saveCimiteri: saveCimiteriOffline } = useOfflineCimiteri();
  const [saving, setSaving] = useState(false);
  const [filteredItems, setFilteredItems] = useState(cimiteri || []);

  // Gestione della ricerca
  useEffect(() => {
    if (cimiteri) {
      const filtered = cimiteri.filter(item => 
        item.Descrizione.toLowerCase().includes(searchInput.toLowerCase()) ||
        (item.Indirizzo && item.Indirizzo.toLowerCase().includes(searchInput.toLowerCase()))
      );
      setFilteredItems(filtered);
    }
  }, [searchInput, cimiteri]);

  // Sincronizzazione input con stato globale
  useEffect(() => {
    setSearchInput(searchTerm || "");
  }, [searchTerm]);

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

  // Component di ricerca personalizzato
  const CustomSearchInput = ({ value, onChange, placeholder, className }) => {
    return (
      <div className={`relative ${className}`}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9 pr-9 bg-black/20 border-gray-800 text-white placeholder:text-gray-500 text-sm h-9 focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)]"
        />
        {value && (
          <button 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="p-4">
          <nav className="flex items-center space-x-1 text-sm text-gray-400 mb-6">
            <a href="/" className="text-gray-300 hover:text-white">Home</a>
            <span className="mx-2">/</span>
            <span className="text-gray-300">Cimiteri</span>
          </nav>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4 mb-6">
            <h1 className="text-2xl font-bold">Cimiteri</h1>
            <div className="flex items-center gap-2">
              {!isOnline && <div className="text-amber-400 text-xs flex items-center">
                <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                Modalità offline
              </div>}
              
              <CustomSearchInput 
                value={searchInput}
                onChange={setSearchInput}
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
            onSelectCimitero={(cimitero) => navigate(`/cimiteri/${cimitero.Id}`)}
            isOnline={isOnline}
          />
        </div>
      </div>
    </Layout>
  );
};
