
import { useState } from "react";
import { Search, X, ChevronRight, Home } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Settore } from "../../../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SectorsTabProps {
  settori: Settore[];
}

export const SectorsTab = ({ settori }: SectorsTabProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSettore, setSelectedSettore] = useState<Settore | null>(null);

  // Ordina i settori alfabeticamente per descrizione
  const sortedSettori = [...settori].sort((a, b) => 
    (a.Descrizione || "").localeCompare(b.Descrizione || "")
  );

  // Filtra i settori in base alla ricerca
  const filteredSettori = sortedSettori.filter(settore => 
    settore.Descrizione?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="space-y-3">
        {/* Search input */}
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
              className="px-3 py-2 bg-black/20 rounded-md border border-gray-800/50 hover:border-[var(--primary-color)] transition-colors text-left group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                  {settore.Descrizione}
                </span>
                {settore.blocchi && settore.blocchi.length > 0 && (
                  <span className="text-xs px-1.5 py-0.5 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded">
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
        <DialogContent className="flex flex-col p-0 bg-[#1A1F2C] border-gray-800 h-[85vh] max-w-4xl">
          <DialogClose className="absolute right-4 top-2 z-50 rounded-full bg-black/40 p-2 hover:bg-black/60 transition-colors">
            <X className="h-5 w-5 text-white" />
          </DialogClose>

          <ScrollArea className="flex-grow">
            <div className="px-6 py-4 space-y-4">
              {/* Breadcrumb */}
              <nav className="flex items-center space-x-1 text-sm text-gray-400">
                <div className="flex items-center">
                  <Home className="h-4 w-4" />
                  <ChevronRight className="h-4 w-4" />
                  <span>Cimiteri</span>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-gray-300">{selectedSettore?.Descrizione}</span>
                </div>
              </nav>

              {/* Lista Blocchi */}
              <div className="space-y-2 px-2">
                {selectedSettore?.blocchi && selectedSettore.blocchi.length > 0 ? (
                  selectedSettore.blocchi.map((blocco) => (
                    <div 
                      key={blocco.Id}
                      className="p-4 bg-black/20 rounded-lg border border-gray-800/50 hover:border-[var(--primary-color)] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {blocco.Descrizione || "Blocco senza descrizione"}
                          </p>
                          {blocco.Codice && (
                            <p className="text-xs text-gray-500 mt-1">
                              Codice: {blocco.Codice}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {blocco.NumeroFile && (
                            <span className="text-xs px-1.5 py-0.5 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded">
                              File: {blocco.NumeroFile}
                            </span>
                          )}
                          {blocco.NumeroLoculi && (
                            <span className="text-xs px-1.5 py-0.5 bg-[var(--primary-color)]/10 text-[var(--primary-color)] rounded">
                              Loculi: {blocco.NumeroLoculi}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Nessun blocco presente in questo settore
                  </p>
                )}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};
