import { Skull, Copy, MoreHorizontal } from "lucide-react";
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
      className="h-[calc(100vh-8.5rem)] rounded-lg"
    >
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {messages.length === 0 && !isProcessing && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-[#E5DEFF] to-[#8B5CF6] rounded-xl flex items-center justify-center shadow-xl shadow-[#8B5CF6]/20 border border-white/20 backdrop-blur-sm">
                <Skull className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-semibold">Come posso aiutarti?</h2>
              <p className="text-sm text-gray-400">Usa /test-model per verificare il modello AI in uso</p>
            </div>
            <SuggestedQuestions onSelect={onQuestionSelect} />
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className="animate-fade-in space-y-6">
            {message.type === 'query' && (
              <div className="flex justify-end">
                <div className="max-w-[80%] bg-[var(--primary-color)]/20 rounded-2xl rounded-tr-sm p-4 border border-[var(--primary-color)]/30 backdrop-blur-sm">
                  <p className="text-gray-100 whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            )}
            
            {message.type === 'response' && (
              <div className="space-y-4 max-w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E5DEFF] to-[#8B5CF6] flex items-center justify-center flex-shrink-0 shadow-xl shadow-[#8B5CF6]/20 border border-white/20 backdrop-blur-sm transform hover:scale-105 transition-all duration-200">
                    <Skull className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-200">Assistente AI</span>
                    <span className="text-xs text-gray-400">
                      {format(message.timestamp || new Date(), "d MMMM yyyy, HH:mm", { locale: it })}
                    </span>
                  </div>
                </div>
                
                <div className="relative group">
                  <div 
                    className="text-gray-200 leading-relaxed whitespace-pre-wrap break-words"
                    onMouseDown={() => handleMouseDown(index)}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    {message.content}
                  </div>
                  
                  <button
                    onClick={() => handleCopyMessage(message.content)}
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 text-gray-400 hover:text-white rounded"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <DropdownMenu open={showOptionsFor === index} onOpenChange={() => setShowOptionsFor(null)}>
                    <DropdownMenuTrigger asChild>
                      <button className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 text-gray-400 hover:text-white rounded">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#1A1F2C] border border-white/10 text-white">
                      <DropdownMenuItem 
                        className="hover:bg-white/5 cursor-pointer"
                        onClick={() => handleCopyMessage(message.content)}
                      >
                        Copia testo
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="hover:bg-white/5 cursor-pointer"
                        onClick={() => onQuestionSelect(message.content)}
                      >
                        Ripeti domanda
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {message.data && (
                  <div className="bg-[#2A2F3C]/80 rounded-lg p-4 border border-[#3A3F4C]/50 backdrop-blur-sm shadow-lg">
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
        ))}

        {isProcessing && (
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E5DEFF] to-[#8B5CF6] flex items-center justify-center flex-shrink-0 shadow-xl shadow-[#8B5CF6]/20 border border-white/20 backdrop-blur-sm">
              <Skull className="w-5 h-5 text-white" />
            </div>
            <div className="bg-[#2A2F3C]/80 rounded-2xl rounded-tl-sm p-3 border border-[#3A3F4C]/50 backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#E5DEFF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-[#E5DEFF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-[#E5DEFF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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
