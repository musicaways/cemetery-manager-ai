
import { useState } from "react";
import { Search } from "lucide-react";
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
          className="pl-9 bg-black/20 border-gray-800 text-white placeholder:text-gray-500 text-sm h-9"
        />
      </div>

      {/* Sectors grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
