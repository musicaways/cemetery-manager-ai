
import { useState, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessages } from "@/components/ChatMessages";
import { ChatModals } from "@/components/chat/ChatModals";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { OfflineIndicator } from "@/pages/cimiteri/components/OfflineIndicator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import type { Cimitero } from "@/pages/cimiteri/types";

const Index = () => {
  const [isMediaUploadOpen, setIsMediaUploadOpen] = useState(false);
  const [isFunctionsOpen, setIsFunctionsOpen] = useState(false);
  const [selectedCimitero, setSelectedCimitero] = useState<Cimitero | null>(null);
  
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
      await handleSubmit(e, q);
    } catch (err) {
      handleError(err instanceof Error ? err : new Error(String(err)), {
        inputQuery: q,
        component: 'ChatInput'
      });
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[var(--chat-bg)] text-gray-100 overflow-hidden flex flex-col">
        <Breadcrumb items={[{ label: "Chat" }]} />
        <OfflineIndicator isOnline={isOnline} />
        <main className="flex-1 pb-20 mt-7">
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
