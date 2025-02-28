
import { forwardRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, WifiOff } from "lucide-react";
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { SuggestedQuestions } from "./SuggestedQuestions";
import { CimiteroCard } from "@/pages/cimiteri/components/CimiteroCard";
import { CimiteriGrid } from "@/pages/cimiteri/components/CimiteriGrid";
import { CemeteryTravelInfo } from "@/pages/cimiteri/components/CemeteryTravelInfo";

interface ChatMessagesProps {
  messages: {
    type: 'query' | 'response';
    content: string;
    data?: any;
    timestamp?: Date;
  }[];
  isProcessing: boolean;
  onQuestionSelect: (question: string) => void;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onCimiteroSelect?: (cimitero: any) => void;
  isOnline?: boolean;
}

export const ChatMessages = forwardRef<HTMLDivElement, ChatMessagesProps>(({
  messages,
  isProcessing,
  onQuestionSelect,
  scrollAreaRef,
  messagesEndRef,
  onCimiteroSelect,
  isOnline = true
}, ref) => {
  return (
    <ScrollArea 
      ref={scrollAreaRef}
      className="h-[calc(100vh-8.5rem)]"
    >
      <div className="space-y-6">
        {messages.length === 0 && !isProcessing && (
          <div className="flex flex-col items-center justify-center h-full">
            {!isOnline ? (
              <div className="flex flex-col items-center text-center p-6 max-w-md">
                <WifiOff className="h-12 w-12 text-amber-400 mb-4" />
                <p className="text-amber-200 text-lg font-medium">Modalità offline attiva</p>
                <p className="text-gray-400 text-sm mt-2">
                  Le funzionalità sono limitate ma puoi comunque chiedere informazioni sui cimiteri disponibili localmente.
                </p>
                <div className="mt-6 w-full">
                  <SuggestedQuestions 
                    onSelect={onQuestionSelect}
                    offline={true}
                  />
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">
                Inizia una nuova conversazione.
              </p>
            )}
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} data-message-index={index} className="animate-fade-in">
            {message.type === 'query' && (
              <div className="flex justify-end pr-2">
                <div className="max-w-[95%] bg-[var(--primary-color)]/20 rounded-2xl rounded-tr-sm p-3 border border-[var(--primary-color)]/30 backdrop-blur-sm">
                  <p className="text-sm text-gray-100 whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            )}
            
            {message.type === 'response' && (
              <div className="space-y-3 w-full">
                <div className="flex items-start pl-1">
                  <Bot className="w-8 h-8 text-[#8B5CF6] flex-shrink-0" />
                  <div className="flex flex-col w-full min-w-0">
                    <div className="flex items-center justify-between pl-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-200">Assistente AI</span>
                        <span className="text-xs text-gray-400">
                          {format(message.timestamp || new Date(), "d MMMM yyyy, HH:mm", { locale: it })}
                          {!isOnline && <span className="ml-2 text-amber-400">(offline)</span>}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-100 whitespace-pre-wrap pl-2">
                      {message.content}
                    </div>
                    
                    {message.data?.type === 'cimitero' && message.data.cimitero && (
                      <div className="mt-4 pl-2 space-y-4">
                        <CimiteroCard 
                          cimitero={message.data.cimitero}
                          onClick={() => onCimiteroSelect?.(message.data.cimitero)}
                          isOffline={!isOnline}
                        />
                        
                        {message.data.cimitero.Indirizzo && isOnline && (
                          <CemeteryTravelInfo
                            address={message.data.cimitero.Indirizzo}
                            city={message.data.cimitero.Descrizione.split(' ')[0]} // Assume che la prima parola sia la città
                          />
                        )}
                      </div>
                    )}
                    
                    {message.data?.type === 'cimiteri' && message.data.cimiteri && message.data.cimiteri.length > 0 && (
                      <div className="mt-4 pl-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {message.data.cimiteri.map((cimitero: any, idx: number) => (
                            <CimiteroCard 
                              key={`cim-${idx}`}
                              cimitero={cimitero}
                              onClick={() => {
                                if (onCimiteroSelect) {
                                  onCimiteroSelect(cimitero);
                                }
                              }}
                              isOffline={!isOnline}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {message.data?.suggestions && (
                      <div className="mt-4 pl-2">
                        <SuggestedQuestions 
                          onSelect={onQuestionSelect}
                          offline={!isOnline}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-start pl-1">
            <Bot className="w-8 h-8 text-[#8B5CF6] flex-shrink-0" />
            <div className="bg-[#2A2F3C]/80 rounded-2xl rounded-tl-sm p-3 border border-[#3A3F4C]/50 backdrop-blur-sm ml-2">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-[#E5DEFF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-[#E5DEFF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-[#E5DEFF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>
    </ScrollArea>
  );
});

ChatMessages.displayName = "ChatMessages";
