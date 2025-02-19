
import { Skull } from "lucide-react";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { ResultsList } from "./ResultsList";
import { ScrollArea } from "@/components/ui/scroll-area";
import { forwardRef } from "react";
import { Bot, Image, Command, Globe, Plus } from "lucide-react";
import { useTheme } from "@/lib/themeContext";

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

export const ChatMessages = forwardRef<HTMLDivElement, ChatMessagesProps>(({
  messages,
  isProcessing,
  onQuestionSelect,
  scrollAreaRef,
  messagesEndRef
}, ref) => {
  const { theme } = useTheme();
  const isChatGPT = theme === 'chatgpt';

  return (
    <ScrollArea 
      ref={scrollAreaRef}
      className="h-[calc(100vh-10rem)] custom-scrollbar"
    >
      <div className="max-w-3xl mx-auto px-4 pb-24 space-y-6">
        {messages.length === 0 && !isProcessing && (
          <div className="animate-slide-up space-y-8">
            <h1 className="text-4xl font-semibold text-center text-foreground mt-8">
              {isChatGPT ? "In cosa posso esserti utile?" : "Come posso aiutarti oggi?"}
            </h1>
            
            <div className={isChatGPT ? 'quick-actions' : 'grid grid-cols-2 gap-4 max-w-2xl mx-auto mt-8'}>
              <button className={isChatGPT ? 'quick-action-button' : 'flex items-center gap-3 p-4 rounded-2xl bg-secondary/50 backdrop-blur-sm border border-border/50 text-sm text-foreground hover:bg-secondary/80 transition-colors duration-200'}>
                <Image className={isChatGPT ? 'w-5 h-5 text-emerald-400' : 'w-5 h-5 text-primary'} />
                Crea immagine
              </button>
              <button className={isChatGPT ? 'quick-action-button' : 'flex items-center gap-3 p-4 rounded-2xl bg-secondary/50 backdrop-blur-sm border border-border/50 text-sm text-foreground hover:bg-secondary/80 transition-colors duration-200'}>
                <Command className={isChatGPT ? 'w-5 h-5 text-blue-400' : 'w-5 h-5 text-primary'} />
                Analizza i dati
              </button>
              <button className={isChatGPT ? 'quick-action-button' : 'flex items-center gap-3 p-4 rounded-2xl bg-secondary/50 backdrop-blur-sm border border-border/50 text-sm text-foreground hover:bg-secondary/80 transition-colors duration-200'}>
                <Globe className={isChatGPT ? 'w-5 h-5 text-amber-400' : 'w-5 h-5 text-primary'} />
                Prepara un piano
              </button>
              <button className={isChatGPT ? 'quick-action-button' : 'flex items-center gap-3 p-4 rounded-2xl bg-secondary/50 backdrop-blur-sm border border-border/50 text-sm text-foreground hover:bg-secondary/80 transition-colors duration-200'}>
                <Plus className={isChatGPT ? 'w-5 h-5 text-gray-400' : 'w-5 h-5 text-primary'} />
                Altre opzioni
              </button>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`animate-slide-up ${message.type === 'response' && isChatGPT ? 'bg-[#444654]' : ''}`}
          >
            <div className="max-w-3xl mx-auto">
              <div className={`flex items-start gap-4 ${isChatGPT ? 'px-4 py-6' : 'p-6'}`}>
                {message.type === 'response' && (
                  <div className={isChatGPT ? 'avatar' : 'w-8 h-8 rounded-lg flex items-center justify-center bg-primary'}>
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <p className={isChatGPT ? 'message-content' : 'text-foreground whitespace-pre-wrap'}>
                    {message.content}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className={`animate-slide-up ${isChatGPT ? 'bg-[#444654]' : ''}`}>
            <div className="max-w-3xl mx-auto">
              <div className={`flex items-start gap-4 ${isChatGPT ? 'px-4 py-6' : 'p-6'}`}>
                <div className={isChatGPT ? 'avatar' : 'w-8 h-8 rounded-lg flex items-center justify-center bg-primary'}>
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className={isChatGPT ? 'thinking' : 'flex gap-1'}>
                  <div className={isChatGPT ? 'thinking-dot' : 'w-2 h-2 bg-foreground/60 rounded-full animate-bounce'} style={{ animationDelay: '0ms' }}></div>
                  <div className={isChatGPT ? 'thinking-dot' : 'w-2 h-2 bg-foreground/60 rounded-full animate-bounce'} style={{ animationDelay: '150ms' }}></div>
                  <div className={isChatGPT ? 'thinking-dot' : 'w-2 h-2 bg-foreground/60 rounded-full animate-bounce'} style={{ animationDelay: '300ms' }}></div>
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
