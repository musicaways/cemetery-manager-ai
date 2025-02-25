
import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Settore } from "../../../types";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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

  // Log per debug
  console.log("Settori:", settori);
  console.log("Settore selezionato:", selectedSettore);
  console.log("Blocchi del settore:", selectedSettore?.blocchi);

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
        <DialogContent className="bg-[#1A1F2C] border-gray-800 text-white">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">
              Blocchi del settore: {selectedSettore?.Descrizione}
            </h2>
            
            {selectedSettore?.blocchi && selectedSettore.blocchi.length > 0 ? (
              <ul className="space-y-2">
                {selectedSettore.blocchi.map((blocco) => (
                  <li 
                    key={blocco.Id}
                    className="p-2 bg-black/20 rounded border border-gray-800/50"
                  >
                    {blocco.Descrizione || "Blocco senza descrizione"}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 italic">Nessun blocco presente in questo settore</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
