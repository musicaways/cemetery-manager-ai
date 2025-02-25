
import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Settore } from "../../../types";

interface SectorsTabProps {
  settori: Settore[];
}

export const SectorsTab = ({ settori }: SectorsTabProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Ordina i settori alfabeticamente per descrizione
  const sortedSettori = [...settori].sort((a, b) => 
    (a.Descrizione || "").localeCompare(b.Descrizione || "")
  );

  // Filtra i settori in base alla ricerca
  const filteredSettori = sortedSettori.filter(settore => 
    settore.Descrizione?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
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

      {/* Sectors list with blocks */}
      <div className="grid grid-cols-1 gap-4">
        {filteredSettori.map((settore) => (
          <div
            key={settore.Id}
            className="bg-black/20 rounded-lg border border-gray-800/50 p-4 space-y-3"
          >
            <h3 className="text-white font-medium">{settore.Descrizione}</h3>
            
            {/* Blocks list */}
            <div className="pl-4 space-y-2">
              <p className="text-sm text-gray-400">Blocchi:</p>
              {settore.blocchi && settore.blocchi.length > 0 ? (
                <ul className="list-disc pl-4 space-y-1">
                  {settore.blocchi.map((blocco) => (
                    <li key={blocco.Id} className="text-sm text-gray-300">
                      {blocco.Descrizione || "Blocco senza descrizione"}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">Nessun blocco presente</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredSettori.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">Nessun settore trovato</p>
        </div>
      )}
    </div>
  );
};
