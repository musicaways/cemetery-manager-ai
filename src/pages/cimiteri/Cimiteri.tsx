import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image, ImagePlus, MapPin, FileText, Info, Save, Edit2, MapPinned } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MediaUpload } from "@/components/MediaUpload";

interface Cimitero {
  Id: number;
  Codice: string;
  Descrizione: string;
  Indirizzo: string | null;
  Latitudine: number | null;
  Longitudine: number | null;
  FotoCopertina: string | null;
  settori: Settore[];
  foto: CimiteroFoto[];
  documenti: CimiteroDocumenti[];
  mappe: CimiteroMappe[];
}

interface Settore {
  Id: number;
  Codice: string;
  Descrizione: string;
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
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState<Partial<Cimitero>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const loadCimiteri = async () => {
    try {
      const { data: cimiteriData, error: cimiteriError } = await supabase
        .from("Cimitero")
        .select(`
          *,
          settori:Settore(*),
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

  const handleEdit = () => {
    setEditMode(true);
    setEditedData(selectedCimitero || {});
  };

  const handleSave = async () => {
    if (!selectedCimitero) return;

    try {
      const { error } = await supabase
        .from("Cimitero")
        .update({
          Descrizione: editedData.Descrizione,
          Indirizzo: editedData.Indirizzo,
          Latitudine: editedData.Latitudine,
          Longitudine: editedData.Longitudine,
          FotoCopertina: editedData.FotoCopertina,
        })
        .eq("Id", selectedCimitero.Id);

      if (error) throw error;

      toast.success("Modifiche salvate con successo");
      setEditMode(false);
      loadCimiteri();
    } catch (error: any) {
      toast.error("Errore durante il salvataggio: " + error.message);
    }
  };

  const handleInputChange = (field: string, value: string | number | null) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUploadComplete = async (url: string) => {
    if (!selectedCimitero) return;
    
    try {
      const { error } = await supabase
        .from("Cimitero")
        .update({ FotoCopertina: url })
        .eq("Id", selectedCimitero.Id);

      if (error) throw error;

      toast.success("Foto di copertina aggiornata");
      loadCimiteri();
    } catch (error: any) {
      toast.error("Errore durante l'aggiornamento della foto: " + error.message);
    }
  };

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
            className="group relative bg-[#1A1F2C] backdrop-blur-xl rounded-xl overflow-hidden border border-white/10 hover:border-[var(--primary-color)] transition-all duration-300 cursor-pointer hover:scale-[0.98]"
          >
            <div className="aspect-video relative overflow-hidden">
              {(cimitero.FotoCopertina || cimitero.foto?.[0]?.Url) ? (
                <img
                  src={cimitero.FotoCopertina || cimitero.foto[0].Url}
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
              <h3 className="text-xl font-semibold text-white mb-2 line-clamp-1">
                {cimitero.Descrizione || "Nome non specificato"}
              </h3>
              <div className="flex items-center text-sm text-gray-400">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="line-clamp-1">{cimitero.Indirizzo || cimitero.Codice || "Indirizzo non specificato"}</span>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center text-gray-400">
                  <Image className="w-4 h-4 mr-1" />
                  <span>{cimitero.foto?.length || 0}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <MapPinned className="w-4 h-4 mr-1" />
                  <span>{cimitero.settori?.length || 0}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <FileText className="w-4 h-4 mr-1" />
                  <span>{cimitero.documenti?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedCimitero} onOpenChange={() => {
        setSelectedCimitero(null);
        setEditMode(false);
      }}>
        <DialogContent className="max-w-4xl bg-[#1A1F2C] border-gray-800 p-0">
          <div className="relative aspect-[21/9] overflow-hidden group">
            {(selectedCimitero?.FotoCopertina || selectedCimitero?.foto?.[0]?.Url) ? (
              <img
                src={selectedCimitero?.FotoCopertina || selectedCimitero?.foto?.[0]?.Url}
                alt={selectedCimitero?.Descrizione || "Foto cimitero"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black/20">
                <ImagePlus className="w-12 h-12 text-gray-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1F2C] to-transparent" />
            {editMode && (
              <Button
                onClick={() => setIsUploadOpen(true)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/80"
              >
                <ImagePlus className="w-4 h-4 mr-2" />
                Cambia foto
              </Button>
            )}
          </div>

          <ScrollArea className="h-[60vh]">
            <div className="p-6">
              <div className="space-y-6">
                {/* Azioni */}
                <div className="flex justify-end space-x-2">
                  {editMode ? (
                    <Button onClick={handleSave} className="bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/90">
                      <Save className="w-4 h-4 mr-2" />
                      Salva
                    </Button>
                  ) : (
                    <Button onClick={handleEdit} variant="outline" className="border-gray-700">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Modifica
                    </Button>
                  )}
                </div>

                {/* Informazioni principali */}
                <div className="space-y-4">
                  {editMode ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">Nome cimitero</label>
                        <Input
                          value={editedData.Descrizione || ""}
                          onChange={(e) => handleInputChange("Descrizione", e.target.value)}
                          className="bg-black/20 border-gray-700 focus:border-[var(--primary-color)]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-gray-400">Indirizzo</label>
                        <Input
                          value={editedData.Indirizzo || ""}
                          onChange={(e) => handleInputChange("Indirizzo", e.target.value)}
                          className="bg-black/20 border-gray-700 focus:border-[var(--primary-color)]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm text-gray-400">Latitudine</label>
                          <Input
                            type="number"
                            step="0.00000001"
                            value={editedData.Latitudine || ""}
                            onChange={(e) => handleInputChange("Latitudine", parseFloat(e.target.value))}
                            className="bg-black/20 border-gray-700 focus:border-[var(--primary-color)]"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-gray-400">Longitudine</label>
                          <Input
                            type="number"
                            step="0.00000001"
                            value={editedData.Longitudine || ""}
                            onChange={(e) => handleInputChange("Longitudine", parseFloat(e.target.value))}
                            className="bg-black/20 border-gray-700 focus:border-[var(--primary-color)]"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold">{selectedCimitero?.Descrizione}</h2>
                      <div className="space-y-2">
                        <p className="text-gray-400 flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {selectedCimitero?.Indirizzo || "Indirizzo non specificato"}
                        </p>
                        {(selectedCimitero?.Latitudine && selectedCimitero?.Longitudine) && (
                          <p className="text-gray-400 flex items-center">
                            <MapPinned className="w-4 h-4 mr-2" />
                            {selectedCimitero.Latitudine}, {selectedCimitero.Longitudine}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Galleria Foto */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Image className="w-5 h-5 mr-2" />
                    Galleria Foto
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

                {/* Settori */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <MapPinned className="w-5 h-5 mr-2" />
                    Settori
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCimitero?.settori?.map((settore) => (
                      <div
                        key={settore.Id}
                        className="p-4 bg-black/20 rounded-lg border border-gray-800 hover:border-[var(--primary-color)] transition-colors"
                      >
                        <h4 className="font-medium mb-1">{settore.Descrizione}</h4>
                        <p className="text-sm text-gray-400">{settore.Codice}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <MediaUpload 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUploadComplete}
      />
    </div>
  );
};

export default Cimiteri;
