
import { useState } from "react";
import { useChat } from "@/hooks/useChat";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessages } from "@/components/ChatMessages";
import { ChatModals } from "@/components/chat/ChatModals";

const Index = () => {
  const [isMediaUploadOpen, setIsMediaUploadOpen] = useState(false);
  const [isFunctionsOpen, setIsFunctionsOpen] = useState(false);
  
  const {
    query,
    setQuery,
    isProcessing,
    messages,
    webSearchEnabled,
    messagesEndRef,
    scrollAreaRef,
    handleSubmit,
    toggleWebSearch
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
        break;
      case 'code':
        break;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--chat-bg)] text-gray-100 overflow-hidden flex flex-col">
      <main className="flex-1 pb-20">
        <ChatMessages
          messages={messages}
          isProcessing={isProcessing}
          onQuestionSelect={(q) => handleSubmit(undefined, q)}
          scrollAreaRef={scrollAreaRef}
          messagesEndRef={messagesEndRef}
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
      />

      <ChatModals
        isMediaUploadOpen={isMediaUploadOpen}
        isFunctionsOpen={isFunctionsOpen}
        onMediaUploadClose={() => setIsMediaUploadOpen(false)}
        onFunctionsClose={() => setIsFunctionsOpen(false)}
        onMediaUpload={(url) => handleSubmit(undefined, url)}
        onFunctionSelect={handleFunctionSelect}
      />
    </div>
  );
};

export default Index;
