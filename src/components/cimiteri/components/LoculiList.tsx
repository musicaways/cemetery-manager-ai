
import { useState, useEffect } from "react";
import { Search, X, ChevronRight, Home, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DefuntiList } from "./DefuntiList";

interface Loculo {
  id: string;
  numero: number;
  fila: number;
  tipo_tomba: number;
  annotazioni: string | null;
}

interface LoculiListProps {
  bloccoId: number | null;
  bloccoDescrizione: string;
  isOpen: boolean;
  onClose: () => void;
}

export const LoculiList = ({ bloccoId, bloccoDescrizione, isOpen, onClose }: LoculiListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loculi, setLoculi] = useState<Loculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoculo, setSelectedLoculo] = useState<{ id: string; numero: number } | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    if (bloccoId && isOpen) {
      loadLoculi();
    }
  }, [bloccoId, isOpen]);

  const loadLoculi = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('loculi')
        .select('*')
        .eq('id_blocco', bloccoId)
        .order('numero', { ascending: true });

      if (error) {
        toast.error("Errore nel caricamento dei loculi: " + error.message);
        return;
      }

      setLoculi(data || []);
    } catch (error: any) {
      toast.error("Errore nel caricamento dei loculi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtra i loculi in base alla ricerca
  const filteredLoculi = loculi.filter(loculo =>
    loculo.numero.toString().includes(searchQuery.toLowerCase()) ||
    loculo.annotazioni?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => onClose()}>
        <DialogContent className={cn(
          "flex flex-col p-0 bg-[#1A1F2C] border-gray-800",
          "h-[calc(100vh-32px)] md:h-[85vh]",
          "transition-all duration-300",
          "w-full max-w-xl mx-auto",
          isMobile ? "m-0 rounded-none" : "rounded-lg"
        )}>
          <div className="relative border-b border-gray-800/50 pt-1">
            <DialogClose className="absolute right-4 top-1 z-50 rounded-full bg-black/40 p-2 hover:bg-black/60 transition-colors">
              <X className="h-5 w-5 text-white" />
            </DialogClose>
            
            {/* Header con breadcrumb */}
            <div className="px-4 py-4 mt-8">
              <nav className="flex items-center space-x-1 text-sm text-gray-400">
                <div className="flex items-center">
                  <Home className="h-4 w-4" />
                  <ChevronRight className="h-4 w-4" />
                  <span>Blocchi</span>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-gray-300">{bloccoDescrizione}</span>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-gray-300">Loculi</span>
                </div>
              </nav>
            </div>
          </div>

          <ScrollArea className="flex-grow">
            <div className="w-full">
              <div className="px-4 py-4 space-y-4">
                {/* Search input per loculi */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="text"
                    placeholder="Cerca loculo..."
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

                {/* Lista Loculi */}
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredLoculi.length > 0 ? (
                      filteredLoculi.map((loculo) => (
                        <div 
                          key={loculo.id}
                          className="p-4 bg-black/20 rounded-lg border border-gray-800/50 hover:border-[var(--primary-color)] transition-colors"
                        >
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-white">
                                Loculo {loculo.numero}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-gray-400 hover:text-white"
                                onClick={() => setSelectedLoculo({ id: loculo.id, numero: loculo.numero })}
                              >
                                <Users className="h-4 w-4 mr-1" />
                                <span className="text-xs">Defunti</span>
                              </Button>
                            </div>
                            {loculo.annotazioni && (
                              <p className="text-xs text-gray-400">
                                {loculo.annotazioni}
                              </p>
                            )}
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span>Tipo tomba: {loculo.tipo_tomba}</span>
                              <span>•</span>
                              <span>Fila: {loculo.fila}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        {searchQuery ? "Nessun loculo trovato con questi criteri di ricerca" : "Nessun loculo presente in questo blocco"}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <DefuntiList
        loculoId={selectedLoculo?.id || null}
        loculoNumero={selectedLoculo?.numero || 0}
        isOpen={!!selectedLoculo}
        onClose={() => setSelectedLoculo(null)}
      />
    </>
  );
};
