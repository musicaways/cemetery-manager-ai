
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Settore } from "../../types";
import { Breadcrumb } from "../CimiteroDetails/components/Breadcrumb";

interface BloccoDetailsProps {
  settore: Settore | null;
  onClose: () => void;
}

export const BloccoDetails = ({
  settore,
  onClose
}: BloccoDetailsProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (!settore) return null;

  // Filtra i blocchi in base alla ricerca
  const filteredBlocchi = settore.blocchi?.filter(blocco => 
    blocco.Descrizione?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blocco.Codice?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <Dialog open={!!settore} onOpenChange={() => onClose()}>
      <DialogContent className={cn(
        "flex flex-col p-0 bg-[#1A1F2C] border-gray-800",
        "h-[calc(100vh-32px)] md:h-[85vh]",
        "transition-all duration-300",
        isMobile ? "w-full m-0 rounded-none" : "max-w-4xl"
      )}>
        <DialogClose className="absolute right-4 top-2 z-50 rounded-full bg-black/40 p-2 hover:bg-black/60 transition-colors">
          <X className="h-5 w-5 text-white" />
        </DialogClose>

        <ScrollArea className="flex-grow scrollbar-none">
          <div className="space-y-4">
            {/* Header */}
            <div className="w-full aspect-[21/9] relative overflow-hidden bg-black/20">
              <div className="absolute inset-0 flex items-center justify-center">
                <h2 className="text-2xl font-bold text-white">{settore.Descrizione}</h2>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1F2C] to-transparent opacity-50" />
            </div>

            <div className="px-2 md:px-4">
              <Breadcrumb description={`Settore ${settore.Descrizione}`} />

              {/* Search input */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Cerca blocco..."
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

              {/* Blocchi Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {filteredBlocchi.map((blocco) => (
                  <div
                    key={blocco.Id}
                    className="px-4 py-3 bg-black/20 border border-gray-800/50 rounded-lg hover:border-[var(--primary-color)]/20 transition-colors"
                  >
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-medium text-white">{blocco.Descrizione}</span>
                      <span className="text-xs text-gray-400">Codice: {blocco.Codice}</span>
                      <div className="flex gap-2 text-xs text-gray-400">
                        <span>File: {blocco.NumeroFile || 0}</span>
                        <span>•</span>
                        <span>Loculi: {blocco.NumeroLoculi || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredBlocchi.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">Nessun blocco trovato</p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
