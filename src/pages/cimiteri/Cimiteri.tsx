
import { useState } from "react";
import { useCimiteri } from "./hooks/useCimiteri";
import { useSearch } from "./hooks/useSearch";
import { CimiteriGrid } from "./components/CimiteriGrid";
import { CimiteroEditor } from "./components/CimiteroEditor";
import { Cimitero } from "./types";
import { Breadcrumb } from "./components/Breadcrumb";

export const Cimiteri = () => {
  const { cimiteri, loading, updateCimitero, loadCimiteri } = useCimiteri();
  const { searchTerm } = useSearch();
  const [selectedCimitero, setSelectedCimitero] = useState<Cimitero | null>(null);

  const handleSave = async (editedData: Partial<Cimitero>, coverImage?: File) => {
    if (!selectedCimitero) return;
    await updateCimitero(selectedCimitero.Id, editedData, coverImage);
  };

  const handleUploadComplete = async (url: string) => {
    if (!selectedCimitero) return;
    await updateCimitero(selectedCimitero.Id, { FotoCopertina: url });
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
    <>
      <Breadcrumb />
      <div className="container mx-auto px-4 py-8 mt-14">
        <CimiteriGrid 
          cimiteri={filteredCimiteri}
          onSelectCimitero={setSelectedCimitero}
        />

        <CimiteroEditor
          cimitero={selectedCimitero}
          onClose={() => setSelectedCimitero(null)}
          onSave={handleSave}
          onUploadComplete={handleUploadComplete}
        />
      </div>
    </>
  );
};

export default Cimiteri;
