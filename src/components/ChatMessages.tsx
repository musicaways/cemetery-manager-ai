
import { forwardRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot } from "lucide-react";
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { SuggestedQuestions } from "./SuggestedQuestions";

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
}

export const ChatMessages = forwardRef<HTMLDivElement, ChatMessagesProps>(({
  messages,
  isProcessing,
  onQuestionSelect,
  scrollAreaRef,
  messagesEndRef
}, ref) => {
  return (
    <ScrollArea 
      ref={scrollAreaRef}
      className="h-[calc(100vh-8.5rem)]"
    >
      <div className="space-y-6">
        {messages.length === 0 && !isProcessing && (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-400 text-sm">
              Inizia una nuova conversazione.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} data-message-index={index} className="animate-fade-in">
            {message.type === 'query' && (
              <div className="flex justify-end px-2">
                <div className="max-w-[95%] bg-[var(--primary-color)]/20 rounded-2xl rounded-tr-sm p-3 border border-[var(--primary-color)]/30 backdrop-blur-sm">
                  <p className="text-sm text-gray-100 whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            )}
            
            {message.type === 'response' && (
              <div className="space-y-3 w-full px-2">
                <div className="flex items-start gap-2">
                  <Bot className="w-8 h-8 text-[#8B5CF6] -ml-0.5 flex-shrink-0" />
                  <div className="flex flex-col w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-200">Assistente AI</span>
                        <span className="text-xs text-gray-400">
                          {format(message.timestamp || new Date(), "d MMMM yyyy, HH:mm", { locale: it })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-100 whitespace-pre-wrap">
                      {message.content}
                    </div>
                    
                    {message.data?.suggestions && (
                      <div className="mt-4">
                        <SuggestedQuestions 
                          onSelect={onQuestionSelect}
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
          <div className="flex items-start gap-2 px-2">
            <Bot className="w-8 h-8 text-[#8B5CF6] -ml-0.5 flex-shrink-0" />
            <div className="bg-[#2A2F3C]/80 rounded-2xl rounded-tl-sm p-3 border border-[#3A3F4C]/50 backdrop-blur-sm">
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
