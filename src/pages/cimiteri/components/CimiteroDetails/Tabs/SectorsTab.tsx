
import { useState } from "react";
import { Search, X, ChevronRight, Home } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Settore } from "../../../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { LoculiList } from "@/components/cimiteri/components/LoculiList";

interface SectorsTabProps {
  settori: Settore[];
}

export const SectorsTab = ({ settori }: SectorsTabProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSettore, setSelectedSettore] = useState<Settore | null>(null);
  const [searchBlocchi, setSearchBlocchi] = useState("");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [selectedBlocco, setSelectedBlocco] = useState<{id: number, descrizione: string} | null>(null);

  // Ordina i settori alfabeticamente per descrizione
  const sortedSettori = [...settori].sort((a, b) => 
    (a.Descrizione || "").localeCompare(b.Descrizione || "")
  );

  // Filtra i settori in base alla ricerca
  const filteredSettori = sortedSettori.filter(settore => 
    settore.Descrizione?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtra i blocchi in base alla ricerca
  const filteredBlocchi = selectedSettore?.blocchi?.filter(blocco =>
    blocco.Descrizione?.toLowerCase().includes(searchBlocchi.toLowerCase()) ||
    blocco.Codice?.toLowerCase().includes(searchBlocchi.toLowerCase())
  );

  return (
    <>
      <div className="space-y-3">
        {/* Search input per settori */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Cerca settore..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 bg-black/20 border-gray-800 text-white placeholder:text-gray-500 text-sm h-9 focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)]"
          />
          {searchQuery && (
            <button 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sectors list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
          {filteredSettori.map((settore) => (
            <button
              key={settore.Id}
              onClick={() => setSelectedSettore(settore)}
              className="p-3 bg-black/20 rounded-md border border-gray-800/50 hover:border-[var(--primary-color)] transition-colors text-left group"
            >
              <div className="flex flex-col space-y-2">
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                  {settore.Descrizione}
                </span>
                {settore.blocchi && settore.blocchi.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {settore.blocchi.length} {settore.blocchi.length === 1 ? 'blocco' : 'blocchi'}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Dialog per mostrare i blocchi del settore selezionato */}
      <Dialog open={!!selectedSettore} onOpenChange={() => setSelectedSettore(null)}>
        <DialogContent className={cn(
          "flex flex-col p-0 bg-[#1A1F2C] border-gray-800",
          "h-[calc(100vh-32px)] md:h-[85vh]",
          "transition-all duration-300",
          "w-full max-w-xl mx-auto",
          isMobile ? "m-0 rounded-none" : "rounded-lg"
        )}>
          <div className="relative border-b border-gray-800/50 pt-1">
            <DialogClose className="absolute right-4 top-4 z-50 rounded-full bg-black/40 p-2 hover:bg-black/60 transition-colors">
              <X className="h-5 w-5 text-white" />
            </DialogClose>

            {/* Header con breadcrumb */}
            <div className="px-4 py-4 mt-8">
              <nav className="flex items-center space-x-1 text-sm text-gray-400">
                <div className="flex items-center">
                  <Home className="h-4 w-4" />
                  <ChevronRight className="h-4 w-4" />
                  <span>Cimiteri</span>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-gray-300">{selectedSettore?.Descrizione}</span>
                </div>
              </nav>
            </div>
          </div>

          <ScrollArea className="flex-grow">
            <div className="w-full">
              <div className="px-4 py-4 space-y-4">
                {/* Search input per blocchi */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Cerca blocco..."
                    value={searchBlocchi}
                    onChange={(e) => setSearchBlocchi(e.target.value)}
                    className="pl-9 pr-9 bg-black/20 border-gray-800 text-white placeholder:text-gray-500 text-sm h-9 focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)]"
                  />
                  {searchBlocchi && (
                    <button 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                      onClick={() => setSearchBlocchi("")}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Lista Blocchi */}
                <div className="space-y-2">
                  {filteredBlocchi && filteredBlocchi.length > 0 ? (
                    filteredBlocchi.map((blocco) => (
                      <div 
                        key={blocco.Id}
                        className="p-4 bg-black/20 rounded-lg border border-gray-800/50 hover:border-[var(--primary-color)] transition-colors cursor-pointer"
                        onClick={() => setSelectedBlocco({
                          id: blocco.Id,
                          descrizione: blocco.Descrizione || `Blocco ${blocco.Codice}`
                        })}
                      >
                        <div className="flex flex-col space-y-2">
                          <p className="text-sm font-medium text-white">
                            {blocco.Descrizione || "Blocco senza descrizione"}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            {blocco.NumeroFile && (
                              <span>File: {blocco.NumeroFile}</span>
                            )}
                            {blocco.NumeroLoculi && (
                              <>
                                <span>•</span>
                                <span>Loculi: {blocco.NumeroLoculi}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      {searchBlocchi ? "Nessun blocco trovato con questi criteri di ricerca" : "Nessun blocco presente in questo settore"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Lista loculi per il blocco selezionato */}
      <LoculiList
        bloccoId={selectedBlocco?.id || null}
        bloccoDescrizione={selectedBlocco?.descrizione || ""}
        isOpen={!!selectedBlocco}
        onClose={() => setSelectedBlocco(null)}
      />
    </>
  );
};
