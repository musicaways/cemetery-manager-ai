
import { useState, useEffect, Suspense } from "react";
import { useChat } from "@/hooks/useChat";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessages } from "@/components/ChatMessages";
import { ChatModals } from "@/components/chat/ChatModals";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { OfflineIndicator } from "@/pages/cimiteri/components/OfflineIndicator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import type { Cimitero } from "@/pages/cimiteri/types";
import { LoadingScreen } from "@/components/LoadingScreen";

const Index = () => {
  const [isMediaUploadOpen, setIsMediaUploadOpen] = useState(false);
  const [isFunctionsOpen, setIsFunctionsOpen] = useState(false);
  const [selectedCimitero, setSelectedCimitero] = useState<Cimitero | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { handleError } = useErrorHandler({ 
    context: 'chat-page', 
    showToast: true 
  });
  
  const {
    query,
    setQuery,
    isProcessing,
    processingProgress,
    messages,
    webSearchEnabled,
    messagesEndRef,
    scrollAreaRef,
    handleSubmit,
    toggleWebSearch,
    isOnline
  } = useChat();

  // Assicuriamo che il componente sia completamente montato prima di renderizzare
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 250); // Aumentato il tempo per garantire un caricamento completo
    
    return () => clearTimeout(timer);
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
      handleError(err instanceof Error ? err : new Error(String(err)), {
        functionType,
        component: 'FunctionSelect'
      });
    }
  };

  const safeHandleSubmit = async (e?: React.FormEvent, q?: string) => {
    try {
      // Verifica che q sia una stringa
      if (q !== undefined && typeof q !== 'string') {
        console.error('Input non valido per handleSubmit:', q);
        toast.error('Input non valido');
        return;
      }
      
      await handleSubmit(e, q);
    } catch (err) {
      handleError(err instanceof Error ? err : new Error(String(err)), {
        inputQuery: q,
        component: 'ChatInput'
      });
    }
  };

  const handleVoiceRecord = (text: string) => {
    if (typeof text !== 'string') {
      console.error('Input vocale non valido:', text);
      toast.error('Input vocale non valido');
      return;
    }
    
    // Assicurati che l'input vocale sia una stringa
    safeHandleSubmit(undefined, text);
  };

  // Mostra un indicatore di caricamento mentre l'app si inizializza
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[var(--chat-bg)] text-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-[#8B5CF6] border-t-transparent rounded-full"></div>
          <p className="text-sm text-gray-400">Inizializzazione dell'assistente...</p>
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
          <Suspense fallback={
            <div className="flex items-center justify-center h-[50vh]">
              <div className="animate-spin h-8 w-8 border-4 border-[#8B5CF6] border-t-transparent rounded-full"></div>
            </div>
          }>
            <ChatMessages
              messages={messages}
              isProcessing={isProcessing}
              processingProgress={processingProgress}
              onQuestionSelect={(q) => safeHandleSubmit(undefined, q)}
              scrollAreaRef={scrollAreaRef}
              messagesEndRef={messagesEndRef}
              onCimiteroSelect={setSelectedCimitero}
              isOnline={isOnline}
            />
          </Suspense>
        </main>

        <ChatInput
          query={query}
          isProcessing={isProcessing}
          onQueryChange={setQuery}
          onSubmit={safeHandleSubmit}
          onMediaUploadClick={() => setIsMediaUploadOpen(true)}
          onFunctionsClick={() => setIsFunctionsOpen(true)}
          onVoiceRecord={handleVoiceRecord}
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
