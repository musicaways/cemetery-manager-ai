
import React, { useEffect, useState } from "react";
import { Message } from "@/hooks/chat/types";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { ResultsList } from "./ResultsList";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImagePlus, ExternalLink, AlertCircle } from "lucide-react";
import { CimiteriList } from "./chat/CimiteriList";
import { CimiteroDetailsDialog } from "./chat/CimiteroDetailsDialog";
import { Cimitero } from "@/pages/cimiteri/types";

interface ChatMessagesProps {
  messages: Message[];
  isProcessing: boolean;
  onQuestionSelect: (question: string) => void;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onCimiteroSelect: (cimitero: Cimitero) => void;
  isOnline?: boolean;
}

export const ChatMessages = ({
  messages,
  isProcessing,
  onQuestionSelect,
  scrollAreaRef,
  messagesEndRef,
  onCimiteroSelect,
  isOnline = true
}: ChatMessagesProps) => {
  const [animateIndex, setAnimateIndex] = useState(-1);

  useEffect(() => {
    if (messages.length) {
      setAnimateIndex(messages.length - 1);
    }
  }, [messages.length]);

  const handleCimiteroSelect = (cimitero: Cimitero) => {
    console.log("Cimitero selezionato in ChatMessages:", cimitero);
    if (onCimiteroSelect) {
      onCimiteroSelect(cimitero);
    }
  };

  return (
    <ScrollArea className="h-full px-4" viewportRef={scrollAreaRef}>
      <div className="w-full max-w-2xl mx-auto pb-6">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`py-4 ${message.role === "assistant" ? "chat-message-assistant" : "chat-message-user"} ${
              index === animateIndex ? "animate-fade-in" : ""
            }`}
          >
            {message.role === "user" ? (
              <div className="flex items-start gap-3">
                <div className="flex-1 px-4 py-3 bg-[var(--user-bg)] rounded-lg shadow-sm text-white">
                  {message.content}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white">
                  <ImagePlus className="w-4 h-4" />
                </div>
                <div className="flex-1 flex flex-col gap-4">
                  <div className="markdown-content text-white">
                    {message.content}
                  </div>

                  {/* Renderizza i risultati dei cimiteri se presenti */}
                  {message.data?.type === "cimiteri" && (
                    <div className="mt-2">
                      <CimiteriList 
                        cimiteri={message.data.cimiteri} 
                        isGrid={message.data.cimiteri.length > 1}
                        onSelectCimitero={handleCimiteroSelect}
                      />
                    </div>
                  )}

                  {/* Risultati di ricerca web */}
                  {message.data?.type === "search-results" && (
                    <div className="mt-2">
                      <ResultsList results={message.data.results} />
                    </div>
                  )}

                  {!isOnline && (
                    <div className="mt-2 flex items-center gap-2 text-amber-400 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>In modalità offline alcune funzionalità potrebbero non essere disponibili</span>
                    </div>
                  )}

                  {message.suggestedQuestions && (
                    <SuggestedQuestions
                      questions={message.suggestedQuestions}
                      onSelect={onQuestionSelect}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {isProcessing && (
          <div className="py-4 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white">
                <ImagePlus className="w-4 h-4" />
              </div>
              <div className="animate-pulse flex space-x-2">
                <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>
    </ScrollArea>
  );
};
