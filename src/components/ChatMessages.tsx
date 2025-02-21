
import { Skull } from "lucide-react";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { ResultsList } from "./ResultsList";
import { ScrollArea } from "@/components/ui/scroll-area";
import { forwardRef } from "react";

interface ChatMessage {
  type: 'query' | 'response';
  content: string;
  data?: any;
}

interface ChatMessagesProps {
  messages: ChatMessage[];
  isProcessing: boolean;
  onQuestionSelect: (q: string) => void;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const determineResultType = (content: string) => {
  return 'cemetery' as const;
};

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
      className="h-[calc(100vh-8.5rem)] rounded-lg"
    >
      <div className="max-w-4xl mx-auto px-4 space-y-4">
        {messages.length === 0 && !isProcessing && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-[#9b87f5] to-[#6E59A5] rounded-xl flex items-center justify-center">
                <Skull className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-semibold">Come posso aiutarti?</h2>
              <p className="text-sm text-gray-400">Usa /test-model per verificare il modello AI in uso</p>
            </div>
            <SuggestedQuestions onSelect={onQuestionSelect} />
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`animate-fade-in flex ${message.type === 'query' ? 'justify-end' : 'justify-start'}`}>
            <div className={`${
              message.type === 'query' 
                ? 'max-w-[80%] ml-auto' 
                : 'max-w-[80%]'
            } w-full break-words`}>
              {message.type === 'query' && (
                <div className="bg-[var(--primary-color)]/20 rounded-2xl rounded-tr-sm p-3 border border-[var(--primary-color)]/30 backdrop-blur-sm">
                  <p className="text-gray-100 whitespace-pre-wrap">{message.content}</p>
                </div>
              )}
              {message.type === 'response' && (
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-hover)] flex items-center justify-center flex-shrink-0">
                      <Skull className="w-4 h-4 text-white" />
                    </div>
                    {message.content && !message.content.includes('```sql') && (
                      <div className="bg-[#2A2F3C]/80 rounded-2xl rounded-tl-sm p-3 border border-[#3A3F4C]/50 backdrop-blur-sm shadow-lg flex-1">
                        <p className="text-gray-200 leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                    )}
                  </div>
                  {message.data && (
                    <div className="bg-[#2A2F3C]/80 rounded-lg p-4 border border-[#3A3F4C]/50 backdrop-blur-sm shadow-lg ml-11">
                      <h3 className="text-lg font-semibold mb-4 text-gray-100">Risultati</h3>
                      <ResultsList 
                        data={message.data}
                        type={determineResultType(message.content)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#9b87f5] to-[#6E59A5] flex items-center justify-center">
              <Skull className="w-4 h-4 text-white" />
            </div>
            <div className="bg-[#2A2F3C]/80 rounded-2xl rounded-tl-sm p-3 border border-[#3A3F4C]/50 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#9b87f5] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-[#9b87f5] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-[#9b87f5] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
