
import { useState, useEffect } from "react";
import { Search, X, ChevronRight, Home } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface Defunto {
  id: string;
  nominativo: string;
  data_nascita: string;
  data_decesso: string;
  eta: number;
  sesso: "M" | "F";
  annotazioni: string | null;
}

interface DefuntiListProps {
  loculoId: string | null;
  loculoNumero: number;
  isOpen: boolean;
  onClose: () => void;
}

export const DefuntiList = ({ loculoId, loculoNumero, isOpen, onClose }: DefuntiListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [defunti, setDefunti] = useState<Defunto[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    if (loculoId && isOpen) {
      loadDefunti();
    }
  }, [loculoId, isOpen]);

  const loadDefunti = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('defunti')
        .select('*')
        .eq('id_loculo', loculoId)
        .order('data_decesso', { ascending: false });

      if (error) {
        toast.error("Errore nel caricamento dei defunti: " + error.message);
        return;
      }

      // Validazione e trasformazione dei dati
      const validatedDefunti: Defunto[] = (data || []).map(d => {
        // Valida il campo sesso, se non è 'M' o 'F', impostiamo un valore di default 'M'
        const validSesso = d.sesso === 'M' || d.sesso === 'F' ? d.sesso : 'M';
        
        return {
          id: d.id,
          nominativo: d.nominativo,
          data_nascita: d.data_nascita,
          data_decesso: d.data_decesso,
          eta: d.eta,
          sesso: validSesso,
          annotazioni: d.annotazioni
        };
      });

      setDefunti(validatedDefunti);
    } catch (error: any) {
      toast.error("Errore nel caricamento dei defunti: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtra i defunti in base alla ricerca
  const filteredDefunti = defunti.filter(defunto =>
    defunto.nominativo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    defunto.annotazioni?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Formatta la data in formato italiano
  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return format(new Date(date), "d MMMM yyyy", { locale: it });
  };

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
          <DialogClose className="absolute right-4 top-1 z-50 rounded-full bg-black/40 p-2 hover:bg-black/60 transition-colors">
            <X className="h-5 w-5 text-white" />
          </DialogClose>
          
          {/* Header con breadcrumb */}
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
              {/* Search input per defunti */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Cerca defunto..."
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

              {/* Lista Defunti */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredDefunti.length > 0 ? (
                    filteredDefunti.map((defunto) => (
                      <div 
                        key={defunto.id}
                        className="p-4 bg-black/20 rounded-lg border border-gray-800/50 hover:border-[var(--primary-color)] transition-colors"
                      >
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-white">
                              {defunto.nominativo}
                            </p>
                            <span className="text-xs text-gray-500">
                              {defunto.sesso === 'M' ? 'Maschio' : 'Femmina'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                            <div>
                              <span className="text-gray-500">Data nascita:</span>
                              <br />
                              {formatDate(defunto.data_nascita)}
                            </div>
                            <div>
                              <span className="text-gray-500">Data decesso:</span>
                              <br />
                              {formatDate(defunto.data_decesso)}
                            </div>
                          </div>
                          {defunto.annotazioni && (
                            <p className="text-xs text-gray-400">
                              {defunto.annotazioni}
                            </p>
                          )}
                          <div className="text-xs text-gray-500">
                            <span>Età: {defunto.eta} anni</span>
                          </div>
                        </div>
                      </div>
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
