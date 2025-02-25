
import { useState } from "react";
import { Search, ChevronDown, X } from "lucide-react";
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
          className="pl-9 pr-12 bg-black/20 border-gray-800 text-white placeholder:text-gray-500 text-sm h-9 focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)]"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              (document.activeElement as HTMLElement).blur();
            }
          }}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {searchQuery && (
            <button 
              className="text-gray-500 hover:text-white transition-colors"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button 
            className="text-gray-500 hover:text-white transition-colors"
            onClick={() => (document.activeElement as HTMLElement).blur()}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Sectors list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5">
        {filteredSettori.map((settore) => (
          <div
            key={settore.Id}
            className="px-3 py-2 bg-black/20 rounded-md border border-gray-800/50 hover:border-[var(--primary-color)] transition-colors"
          >
            <span className="text-sm text-gray-300">{settore.Descrizione}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
