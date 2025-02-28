
import { useState } from "react";
import { useChat } from "@/hooks/useChat";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessages } from "@/components/ChatMessages";
import { ChatModals } from "@/components/chat/ChatModals";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { OfflineIndicator } from "@/pages/cimiteri/components/OfflineIndicator";
import type { Cimitero } from "@/pages/cimiteri/types";
import { toast } from "sonner";

const Index = () => {
  const [isMediaUploadOpen, setIsMediaUploadOpen] = useState(false);
  const [isFunctionsOpen, setIsFunctionsOpen] = useState(false);
  const [selectedCimitero, setSelectedCimitero] = useState<Cimitero | null>(null);
  
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
  };

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
        selectedCimitero={selectedCimitero}
        onCimiteroEditorClose={() => setSelectedCimitero(null)}
      />
    </div>
  );
};

export default Index;
