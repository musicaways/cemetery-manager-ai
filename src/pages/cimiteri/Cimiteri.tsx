
import { useState, useEffect } from "react";
import { useOfflineCimiteri } from "./hooks/useOfflineCimiteri";
import { useSearch } from "./hooks/useSearch";
import { CimiteriGrid } from "./components/CimiteriGrid";
import { CimiteroEditor } from "./components/CimiteroEditor";
import { Cimitero } from "./types";
import { Breadcrumb } from "./components/Breadcrumb";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { useServiceWorker } from "@/hooks/useServiceWorker";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database, MapPin } from "lucide-react";
import { performanceMonitor } from "@/lib/performanceMonitor";
import { eventBus, AppEvents } from "@/lib/eventBus";
import { useErrorHandler } from "@/hooks/useErrorHandler";

export const Cimiteri = () => {
  const { cimiteri, loading, updateCimitero, loadCimiteri, isOnline } = useOfflineCimiteri();
  const { searchTerm } = useSearch();
  const [selectedCimitero, setSelectedCimitero] = useState<Cimitero | null>(null);
  const { cacheCimiteri, clearCache } = useServiceWorker();
  const { handleError, wrapAsync } = useErrorHandler({ context: 'CimiteriPage' });

  // Memorizziamo le metriche di performance
  useEffect(() => {
    const endMeasure = performanceMonitor.startMeasure(
      'cimiteri-page-render',
      'render'
    );
    
    return () => {
      endMeasure();
    };
  }, []);

  // Memorizziamo i dati dei cimiteri nel service worker quando vengono caricati
  useEffect(() => {
    if (cimiteri.length > 0) {
      cacheCimiteri(cimiteri);
      
      // Pubblica l'evento di dati aggiornati
      eventBus.publish(AppEvents.DATA_UPDATED, {
        type: 'cimiteri',
        count: cimiteri.length
      });
    }
  }, [cimiteri, cacheCimiteri]);

  // Carica i cimiteri con gestione errori
  const refreshCimiteri = wrapAsync(async () => {
    try {
      await loadCimiteri();
    } catch (error) {
      console.error("Errore nel caricamento dei cimiteri:", error);
      throw error; // L'errore sarà gestito dal wrapAsync
    }
  }, { action: 'refresh-cimiteri' });

  const handleSave = async (editedData: Partial<Cimitero>, coverImage?: File) => {
    if (!selectedCimitero) return;
    
    try {
      await updateCimitero(selectedCimitero.Id, editedData, coverImage);
    } catch (error: any) {
      handleError(
        error instanceof Error ? error : new Error(error.message || 'Errore sconosciuto'),
        { action: 'save-cimitero', cimiteroId: selectedCimitero.Id }
      );
    }
  };

  const handleUploadComplete = async (url: string) => {
    if (!selectedCimitero) return;
    
    try {
      await updateCimitero(selectedCimitero.Id, { FotoCopertina: url });
    } catch (error: any) {
      handleError(
        error instanceof Error ? error : new Error(error.message || 'Errore sconosciuto'),
        { action: 'update-cover', cimiteroId: selectedCimitero.Id }
      );
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
    <>
      <Breadcrumb />
      <OfflineIndicator isOnline={isOnline} />
      <div className="container mx-auto px-4 py-4 mt-7">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Cimiteri</h1>
            <p className="text-gray-400 text-sm">
              {filteredCimiteri.length} cimiter{filteredCimiteri.length === 1 ? 'o' : 'i'} disponibil{filteredCimiteri.length === 1 ? 'e' : 'i'}
              {searchTerm && ` per la ricerca "${searchTerm}"`}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {!isOnline && (
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2 bg-amber-950/20 text-amber-200 border-amber-800/30 hover:bg-amber-950/40 hover:text-amber-100"
              >
                <Database className="h-4 w-4" />
                Modalità locale
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refreshCimiteri()} 
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Aggiorna
            </Button>
          </div>
        </div>
        
        <CimiteriGrid 
          cimiteri={filteredCimiteri}
          onSelectCimitero={setSelectedCimitero}
          isOnline={isOnline}
        />

        <CimiteroEditor
          cimitero={selectedCimitero}
          onClose={() => setSelectedCimitero(null)}
          onSave={handleSave}
          onUploadComplete={handleUploadComplete}
          isOnline={isOnline}
        />
      </div>
    </>
  );
};

export default Cimiteri;
