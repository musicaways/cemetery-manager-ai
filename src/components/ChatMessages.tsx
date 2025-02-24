import { Skull, Copy, MoreHorizontal, MessageCircle } from "lucide-react";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { ResultsList } from "./ResultsList";
import { ScrollArea } from "@/components/ui/scroll-area";
import { forwardRef, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatMessage {
  type: 'query' | 'response';
  content: string;
  timestamp?: Date;
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
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [showOptionsFor, setShowOptionsFor] = useState<number | null>(null);

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Testo copiato negli appunti");
  };

  const handleMouseDown = (index: number) => {
    const timer = setTimeout(() => {
      setShowOptionsFor(index);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  return (
    <ScrollArea 
      ref={scrollAreaRef}
      className="h-[calc(100vh-8.5rem)]"
    >
      <div className="space-y-6">
        {messages.length === 0 && !isProcessing && (
          <div className="space-y-6 animate-fade-in px-4">
            <div className="text-center space-y-2">
              <div className="w-10 h-10 mx-auto bg-[#8B5CF6] rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold">Come posso aiutarti?</h2>
              <p className="text-sm text-gray-400">Usa /test-model per verificare il modello AI in uso</p>
            </div>
            <SuggestedQuestions onSelect={onQuestionSelect} />
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
              <div className="space-y-3 max-w-[98%] pl-1">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-8 h-8 bg-[#8B5CF6] rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-200">Assistente AI</span>
                    <span className="text-xs text-gray-400">
                      {format(message.timestamp || new Date(), "d MMMM yyyy, HH:mm", { locale: it })}
                    </span>
                  </div>
                </div>
                
                <div className="relative group">
                  <div 
                    className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap break-words"
                    onMouseDown={() => handleMouseDown(index)}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    {message.content}
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleCopyMessage(message.content)}
                      className="p-1.5 text-gray-400 hover:text-white rounded bg-[#2A2F3C]/80"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <DropdownMenu open={showOptionsFor === index} onOpenChange={() => setShowOptionsFor(null)}>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 text-gray-400 hover:text-white rounded bg-[#2A2F3C]/80">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[#1A1F2C] border border-white/10 text-white">
                        <DropdownMenuItem 
                          className="hover:bg-white/5 cursor-pointer text-sm"
                          onClick={() => handleCopyMessage(message.content)}
                        >
                          Copia testo
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="hover:bg-white/5 cursor-pointer text-sm"
                          onClick={() => onQuestionSelect(message.content)}
                        >
                          Ripeti domanda
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {message.data && (
                  <div className="bg-[#2A2F3C]/80 rounded-lg p-4 border border-[#3A3F4C]/50 backdrop-blur-sm shadow-lg">
                    <h3 className="text-sm font-semibold mb-3 text-gray-100">Risultati</h3>
                    <ResultsList 
                      data={message.data}
                      type={determineResultType(message.content)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-start space-x-3 px-2">
            <div className="w-8 h-8 bg-[#8B5CF6] rounded-lg flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
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
