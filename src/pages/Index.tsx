
import { useState, useEffect, lazy, Suspense } from "react";
import { useChat } from "@/hooks/useChat";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessages } from "@/components/ChatMessages";
import { ChatModals } from "@/components/chat/ChatModals";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { OfflineIndicator } from "@/pages/cimiteri/components/OfflineIndicator";
import type { Cimitero } from "@/pages/cimiteri/types";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

// Importiamo il componente CimiteroDetails direttamente
import { CimiteroDetails } from "@/pages/cimiteri/components/CimiteroDetails/CimiteroDetails";

const Index = () => {
  const [isMediaUploadOpen, setIsMediaUploadOpen] = useState(false);
  const [isFunctionsOpen, setIsFunctionsOpen] = useState(false);
  const [selectedCimitero, setSelectedCimitero] = useState<Cimitero | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const navigate = useNavigate();
  
  const {
    query,
    setQuery,
    isProcessing,
    messages,
    webSearchEnabled,
    messagesEndRef,
    scrollAreaRef,
    handleSubmit,
    toggleWebSearch,
    isOnline
  } = useChat();

  // Reset state quando la componente viene montata/smontata
  useEffect(() => {
    return () => {
      setSelectedCimitero(null);
      setIsDetailOpen(false);
    };
  }, []);

  const handleFunctionSelect = (functionType: string) => {
    setIsFunctionsOpen(false);
    switch (functionType) {
      case 'search':
        toggleWebSearch();
        break;
      case 'analyze':
        setIsMediaUploadOpen(true);
        break;
      case 'file':
        toast.info("Funzionalità non ancora implementata");
        break;
      case 'code':
        toast.info("Funzionalità non ancora implementata");
        break;
    }
  };

  const handleCimiteroSelect = (cimitero: Cimitero) => {
    console.log("Cimitero selezionato:", cimitero);
    setSelectedCimitero(cimitero);
    setIsDetailOpen(true);
  };

  const handleDetailClose = () => {
    setIsDetailOpen(false);
    setSelectedCimitero(null);
  };

  // Controlla se siamo in un dispositivo mobile
  const isMobile = window.innerWidth < 768;

  return (
    <div className="min-h-screen bg-[var(--chat-bg)] text-gray-100 overflow-hidden flex flex-col">
      <Breadcrumb items={[{ label: "Chat" }]} />
      <OfflineIndicator isOnline={isOnline} />
      <main className="flex-1 pb-20 mt-7">
        <ChatMessages
          messages={messages}
          isProcessing={isProcessing}
          onQuestionSelect={(q) => handleSubmit(undefined, q)}
          scrollAreaRef={scrollAreaRef}
          messagesEndRef={messagesEndRef}
          onCimiteroSelect={handleCimiteroSelect}
          isOnline={isOnline}
        />
      </main>

      <ChatInput
        query={query}
        isProcessing={isProcessing}
        onQueryChange={setQuery}
        onSubmit={handleSubmit}
        onMediaUploadClick={() => setIsMediaUploadOpen(true)}
        onFunctionsClick={() => setIsFunctionsOpen(true)}
        onVoiceRecord={(text) => handleSubmit(undefined, text)}
        webSearchEnabled={webSearchEnabled}
        onWebSearchToggle={toggleWebSearch}
        isOnline={isOnline}
      />

      <ChatModals
        isMediaUploadOpen={isMediaUploadOpen}
        isFunctionsOpen={isFunctionsOpen}
        onMediaUploadClose={() => setIsMediaUploadOpen(false)}
        onFunctionsClose={() => setIsFunctionsOpen(false)}
        onMediaUpload={(url) => handleSubmit(undefined, url)}
        onFunctionSelect={handleFunctionSelect}
      />

      {/* Utilizziamo Sheet per dispositivi mobili e Dialog per desktop */}
      {isMobile ? (
        <Sheet open={isDetailOpen && !!selectedCimitero} onOpenChange={handleDetailClose}>
          <SheetContent side="right" className="p-0 sm:max-w-xl w-full border-none bg-transparent">
            {selectedCimitero && (
              <div className="h-full">
                <CimiteroDetailsWrapper 
                  cimitero={selectedCimitero} 
                  onClose={handleDetailClose} 
                />
              </div>
            )}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isDetailOpen && !!selectedCimitero} onOpenChange={handleDetailClose}>
          <DialogContent className="p-0 max-w-2xl bg-transparent border-none">
            {selectedCimitero && (
              <CimiteroDetailsWrapper 
                cimitero={selectedCimitero} 
                onClose={handleDetailClose} 
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Wrapper per i dettagli del cimitero
const CimiteroDetailsWrapper = ({ cimitero, onClose }: { cimitero: Cimitero; onClose: () => void }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState<Partial<Cimitero>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleEdit = () => {
    toast.info("La modifica non è disponibile in modalità chat");
  };

  const handleSave = async () => {
    toast.info("La modifica non è disponibile in modalità chat");
    setEditMode(false);
  };

  const handleInputChange = (field: string, value: string | number | null) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpload = () => {
    toast.info("Upload non disponibile in modalità chat");
  };

  const handleRefresh = () => {
    // No-op
  };

  return (
    <CimiteroDetails
      cimitero={cimitero}
      editMode={editMode}
      editedData={editedData}
      onEdit={handleEdit}
      onSave={handleSave}
      onUpload={handleUpload}
      onInputChange={handleInputChange}
      selectedFile={selectedFile}
      onRefresh={handleRefresh}
      onClose={onClose}
    />
  );
};

export default Index;
