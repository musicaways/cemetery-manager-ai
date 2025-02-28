
import { useState, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessages } from "@/components/ChatMessages";
import { ChatModals } from "@/components/chat/ChatModals";
import { MobileNav } from "@/components/MobileNav";
import { Layout } from "@/components/Layout";
import type { Cimitero } from "@/pages/cimiteri/types";
import { cn } from "@/lib/utils";

const Index = () => {
  const [isMediaUploadOpen, setIsMediaUploadOpen] = useState(false);
  const [isFunctionsOpen, setIsFunctionsOpen] = useState(false);
  const [selectedCimitero, setSelectedCimitero] = useState<Cimitero | null>(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  
  // Monitora la larghezza della finestra per il layout responsivo
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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
        break;
      case 'code':
        break;
    }
  };

  const isDesktop = windowWidth >= 1024;

  return (
    <div className="page-container">
      {/* Gli indicatori non sono più necessari in questa pagina dato che abbiamo l'Header */}
      <main className="page-content">
        <div className={cn(
          // Layout a colonne per desktop
          isDesktop ? "grid grid-cols-[1fr_300px] gap-6" : ""
        )}>
          {/* Colonna principale */}
          <div className="flex-1">
            <ChatMessages
              messages={messages}
              isProcessing={isProcessing}
              onQuestionSelect={(q) => handleSubmit(undefined, q)}
              scrollAreaRef={scrollAreaRef}
              messagesEndRef={messagesEndRef}
              onCimiteroSelect={setSelectedCimitero}
              isOnline={isOnline}
            />
          </div>
          
          {/* Colonna laterale su desktop */}
          {isDesktop && (
            <div className="h-[calc(100vh-8.5rem)]">
              <div className="glass-panel rounded-xl p-4 h-full flex flex-col">
                <h3 className="text-lg font-semibold mb-4 text-white">Assistente Cimiteri</h3>
                
                <div className="mb-6">
                  <p className="text-sm text-gray-300 mb-2">Stato</p>
                  <div className="flex items-center space-x-2">
                    <div className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      isOnline ? "bg-green-500" : "bg-amber-500"
                    )}></div>
                    <span className="text-sm">
                      {isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm text-gray-300 mb-2">Ricerca Web</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {webSearchEnabled ? "Attiva" : "Disattiva"}
                    </span>
                    <button 
                      onClick={toggleWebSearch}
                      className={cn(
                        "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                        webSearchEnabled ? "bg-primary" : "bg-gray-700"
                      )}
                      disabled={!isOnline}
                    >
                      <span 
                        className={cn(
                          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          webSearchEnabled ? "translate-x-4" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>
                </div>
                
                <div className="flex-grow overflow-hidden">
                  <p className="text-sm text-gray-300 mb-2">Suggerimenti</p>
                  <div className="space-y-2">
                    {[
                      "Mostrami i cimiteri di Roma",
                      "Informazioni sui cimiteri in Lombardia",
                      "Cerca defunti a Milano",
                      "Orari di apertura del cimitero monumentale"
                    ].map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSubmit(undefined, suggestion)}
                        className="w-full text-left p-2 text-sm bg-white/5 hover:bg-white/10 rounded-md transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
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

      {/* Menu di navigazione inferiore per mobile */}
      <MobileNav />
    </div>
  );
};

export default Index;
