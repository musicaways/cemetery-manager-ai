
import { useState } from "react";
import { ChevronRight, Home } from "lucide-react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { X } from "lucide-react";
import { SearchInput } from "./SearchInput";
import { DefuntoCard } from "./DefuntoCard";
import { useDefunti } from "../hooks/useDefunti";

interface DefuntiListProps {
  loculoId: string | null;
  loculoNumero: number;
  isOpen: boolean;
  onClose: () => void;
}

export const DefuntiList = ({ loculoId, loculoNumero, isOpen, onClose }: DefuntiListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { defunti, loading } = useDefunti(isOpen ? loculoId : null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const filteredDefunti = defunti.filter(defunto =>
    defunto.nominativo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    defunto.annotazioni?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
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
          
          <div className="px-4 py-4 mt-8">
            <nav className="flex items-center space-x-1 text-sm text-gray-400">
              <div className="flex items-center">
                <Home className="h-4 w-4" />
                <ChevronRight className="h-4 w-4" />
                <span>Loculi</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-300">Loculo {loculoNumero}</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-gray-300">Defunti</span>
              </div>
            </nav>
          </div>
        </div>

        <ScrollArea className="flex-grow">
          <div className="w-full">
            <div className="px-4 py-4 space-y-4">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Cerca defunto..."
              />

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredDefunti.length > 0 ? (
                    filteredDefunti.map((defunto) => (
                      <DefuntoCard key={defunto.id} defunto={defunto} />
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      {searchQuery ? "Nessun defunto trovato con questi criteri di ricerca" : "Nessun defunto presente in questo loculo"}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
