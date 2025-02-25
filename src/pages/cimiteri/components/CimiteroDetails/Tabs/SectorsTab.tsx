
import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Settore } from "../../../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
              className="px-3 py-2 bg-black/20 rounded-md border border-gray-800/50 hover:border-[var(--primary-color)] transition-colors text-left"
            >
              <span className="text-sm text-gray-300">{settore.Descrizione}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dialog per mostrare i blocchi del settore selezionato */}
      <Dialog open={!!selectedSettore} onOpenChange={() => setSelectedSettore(null)}>
        <DialogContent className="flex flex-col p-0 bg-[#1A1F2C] border-gray-800 h-[85vh] max-w-4xl">
          <ScrollArea className="flex-grow">
            <div className="p-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-white mb-6">
                  {selectedSettore?.Descrizione}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <div className="bg-black/20 rounded-lg border border-gray-800/50 p-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">
                    Dettagli Settore
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Codice</p>
                      <p className="text-sm text-white">{selectedSettore?.Codice || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ID</p>
                      <p className="text-sm text-white">{selectedSettore?.Id || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-black/20 rounded-lg border border-gray-800/50 p-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">
                    Blocchi
                  </h3>
                  {selectedSettore?.blocchi && selectedSettore.blocchi.length > 0 ? (
                    <div className="space-y-2">
                      {selectedSettore.blocchi.map((blocco) => (
                        <div 
                          key={blocco.Id}
                          className="p-3 bg-black/30 rounded border border-gray-800/50 hover:border-[var(--primary-color)] transition-colors"
                        >
                          <p className="text-sm text-white">
                            {blocco.Descrizione || "Blocco senza descrizione"}
                          </p>
                          {blocco.Codice && (
                            <p className="text-xs text-gray-500 mt-1">
                              Codice: {blocco.Codice}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      Nessun blocco presente in questo settore
                    </p>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};
