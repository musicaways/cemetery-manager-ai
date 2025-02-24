
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Image, ImagePlus, MapPin, FileText, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Cimitero {
  Id: number;
  Codice: string;
  Descrizione: string;
  foto: CimiteroFoto[];
  documenti: CimiteroDocumenti[];
  mappe: CimiteroMappe[];
}

interface CimiteroFoto {
  Id: string;
  Url: string;
  Descrizione: string | null;
  DataInserimento: string;
}

interface CimiteroDocumenti {
  Id: string;
  Url: string;
  NomeFile: string;
  TipoFile: string;
  Descrizione: string | null;
  DataInserimento: string;
}

interface CimiteroMappe {
  Id: string;
  Url: string;
  Descrizione: string | null;
  DataInserimento: string;
}

export const Cimiteri = () => {
  const [cimiteri, setCimiteri] = useState<Cimitero[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCimitero, setSelectedCimitero] = useState<Cimitero | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadCimiteri = async () => {
    try {
      const { data: cimiteriData, error: cimiteriError } = await supabase
        .from("Cimitero")
        .select(`
          *,
          foto:CimiteroFoto(*),
          documenti:CimiteroDocumenti(*),
          mappe:CimiteroMappe(*)
        `);

      if (cimiteriError) throw cimiteriError;

      setCimiteri(cimiteriData || []);
    } catch (error: any) {
      toast.error("Errore nel caricamento dei cimiteri: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCimiteri();
  }, []);

  useEffect(() => {
    const handleSearch = (e: CustomEvent<string>) => {
      setSearchTerm(e.detail);
    };
    
    window.addEventListener('global-search', handleSearch as EventListener);
    return () => window.removeEventListener('global-search', handleSearch as EventListener);
  }, []);

  const filteredCimiteri = cimiteri.filter(cimitero =>
    cimitero.Descrizione?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cimitero.Codice?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCimiteri.map((cimitero) => (
          <div
            key={cimitero.Id}
            onClick={() => setSelectedCimitero(cimitero)}
            className="group relative bg-black/40 backdrop-blur-xl rounded-xl overflow-hidden border border-white/10 hover:border-[var(--primary-color)] transition-all duration-300 cursor-pointer hover:scale-[0.98]"
          >
            <div className="aspect-video relative overflow-hidden">
              {cimitero.foto?.[0]?.Url ? (
                <img
                  src={cimitero.foto[0].Url}
                  alt={cimitero.Descrizione || "Immagine cimitero"}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black/20">
                  <ImagePlus className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                {cimitero.Descrizione || "Nome non specificato"}
              </h3>
              <div className="flex items-center text-sm text-gray-400">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="line-clamp-1">{cimitero.Codice || "Codice non specificato"}</span>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center text-gray-400">
                  <Image className="w-4 h-4 mr-1" />
                  <span>{cimitero.foto?.length || 0}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <FileText className="w-4 h-4 mr-1" />
                  <span>{cimitero.documenti?.length || 0}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{cimitero.mappe?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedCimitero} onOpenChange={() => setSelectedCimitero(null)}>
        <DialogContent className="max-w-4xl h-[80vh] p-0">
          <ScrollArea className="h-full">
            <div className="p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">{selectedCimitero?.Descrizione}</h2>
                  <p className="text-gray-400 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {selectedCimitero?.Codice}
                  </p>
                </div>

                {/* Foto */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Image className="w-5 h-5 mr-2" />
                    Foto
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedCimitero?.foto?.map((foto) => (
                      <div key={foto.Id} className="relative group aspect-video rounded-lg overflow-hidden">
                        <img
                          src={foto.Url}
                          alt={foto.Descrizione || "Foto cimitero"}
                          className="w-full h-full object-cover"
                        />
                        {foto.Descrizione && (
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                            <p className="text-white text-sm text-center">{foto.Descrizione}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documenti */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Documenti
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCimitero?.documenti?.map((doc) => (
                      <a
                        key={doc.Id}
                        href={doc.Url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-4 bg-black/20 rounded-lg hover:bg-black/30 transition-colors"
                      >
                        <FileText className="w-8 h-8 text-[var(--primary-color)] mr-3" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{doc.NomeFile}</p>
                          {doc.Descrizione && (
                            <p className="text-sm text-gray-400 line-clamp-1">{doc.Descrizione}</p>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Mappe */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Mappe
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCimitero?.mappe?.map((mappa) => (
                      <a
                        key={mappa.Id}
                        href={mappa.Url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block aspect-[4/3] relative group rounded-lg overflow-hidden"
                      >
                        <img
                          src={mappa.Url}
                          alt={mappa.Descrizione || "Mappa cimitero"}
                          className="w-full h-full object-cover"
                        />
                        {mappa.Descrizione && (
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                            <p className="text-white text-sm text-center">{mappa.Descrizione}</p>
                          </div>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cimiteri;
