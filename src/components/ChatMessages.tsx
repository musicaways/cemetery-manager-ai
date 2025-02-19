import { Skull } from "lucide-react";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { ResultsList } from "./ResultsList";
import { ScrollArea } from "@/components/ui/scroll-area";
import { forwardRef } from "react";
import { Bot, Image, Command, Globe, Plus } from "lucide-react";

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
      className="h-[calc(100vh-10rem)] chatgpt-scrollbar"
    >
      <div className="max-w-3xl mx-auto px-4 pb-24 space-y-6">
        {messages.length === 0 && !isProcessing && (
          <div className="animate-slide-up space-y-8">
            <h1 className="text-4xl font-semibold text-center text-gray-100 mt-8">
              In cosa posso esserti utile?
            </h1>
            
            <div className="chatgpt-quick-actions">
              <button className="chatgpt-button">
                <Image className="w-5 h-5 text-emerald-400" />
                Crea immagine
              </button>
              <button className="chatgpt-button">
                <Command className="w-5 h-5 text-blue-400" />
                Analizza i dati
              </button>
              <button className="chatgpt-button">
                <Globe className="w-5 h-5 text-amber-400" />
                Prepara un piano
              </button>
              <button className="chatgpt-button">
                <Plus className="w-5 h-5 text-gray-400" />
                Altre opzioni
              </button>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`animate-slide-up ${message.type === 'response' ? 'bg-[#444654]' : ''}`}>
            <div className="max-w-3xl mx-auto">
              <div className="flex items-start gap-4 px-4 py-6">
                {message.type === 'response' && (
                  <div className="w-8 h-8 rounded flex items-center justify-center bg-[#19C37D]">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <p className="text-gray-100 whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="animate-slide-up bg-[#444654]">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-start gap-4 px-4 py-6">
                <div className="w-8 h-8 rounded flex items-center justify-center bg-[#19C37D]">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
});

ChatMessages.displayName = "ChatMessages";
