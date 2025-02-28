
import { useState, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessages } from "@/components/ChatMessages";
import { ChatModals } from "@/components/chat/ChatModals";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { OfflineIndicator } from "@/pages/cimiteri/components/OfflineIndicator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { Cimitero } from "@/pages/cimiteri/types";

const Index = () => {
  const [isMediaUploadOpen, setIsMediaUploadOpen] = useState(false);
  const [isFunctionsOpen, setIsFunctionsOpen] = useState(false);
  const [selectedCimitero, setSelectedCimitero] = useState<Cimitero | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
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

  // Gestione errori
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error("Errore catturato globalmente:", error);
      setError(error.error || new Error(error.message));
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const handleFunctionSelect = (functionType: string) => {
    setIsFunctionsOpen(false);
    try {
      switch (functionType) {
        case 'search':
          toggleWebSearch();
          break;
        case 'analyze':
          setIsMediaUploadOpen(true);
          break;
        case 'file':
          break;
        case 'code':
          break;
      }
    } catch (err) {
      console.error("Errore nella selezione della funzione:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  const safeHandleSubmit = async (e?: React.FormEvent, q?: string) => {
    try {
      await handleSubmit(e, q);
    } catch (err) {
      console.error("Errore nell'invio del messaggio:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--chat-bg)] text-gray-100 p-4 flex flex-col items-center justify-center">
        <div className="bg-red-900/30 border border-red-800 rounded-md p-4 max-w-lg w-full">
          <h2 className="text-xl font-bold text-red-300 mb-2">Si è verificato un errore</h2>
          <p className="text-red-200 mb-4">{error.message}</p>
          <button 
            className="bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            onClick={() => window.location.reload()}
          >
            Ricarica pagina
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[var(--chat-bg)] text-gray-100 overflow-hidden flex flex-col">
        <Breadcrumb items={[{ label: "Chat" }]} />
        <OfflineIndicator isOnline={isOnline} />
        <main className="flex-1 pb-20 mt-7">
          <ChatMessages
            messages={messages}
            isProcessing={isProcessing}
            onQuestionSelect={(q) => safeHandleSubmit(undefined, q)}
            scrollAreaRef={scrollAreaRef}
            messagesEndRef={messagesEndRef}
            onCimiteroSelect={setSelectedCimitero}
            isOnline={isOnline}
          />
        </main>

        <ChatInput
          query={query}
          isProcessing={isProcessing}
          onQueryChange={setQuery}
          onSubmit={safeHandleSubmit}
          onMediaUploadClick={() => setIsMediaUploadOpen(true)}
          onFunctionsClick={() => setIsFunctionsOpen(true)}
          onVoiceRecord={(text) => safeHandleSubmit(undefined, text)}
          webSearchEnabled={webSearchEnabled}
          onWebSearchToggle={toggleWebSearch}
          isOnline={isOnline}
        />

        <ChatModals
          isMediaUploadOpen={isMediaUploadOpen}
          isFunctionsOpen={isFunctionsOpen}
          onMediaUploadClose={() => setIsMediaUploadOpen(false)}
          onFunctionsClose={() => setIsFunctionsOpen(false)}
          onMediaUpload={(url) => safeHandleSubmit(undefined, url)}
          onFunctionSelect={handleFunctionSelect}
          selectedCimitero={selectedCimitero}
          onCimiteroEditorClose={() => setSelectedCimitero(null)}
        />
      </div>
    </ErrorBoundary>
  );
};

export default Index;
