
import { MutableRefObject } from "react";
import type { Cimitero } from "@/pages/cimiteri/types";

export interface Message {
  type: 'query' | 'response';
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  data?: any;
  suggestedQuestions?: string[];
}

export type ChatMessage = Message;

export interface UseChatReturn {
  query: string;
  setQuery: (query: string) => void;
  isProcessing: boolean;
  messages: Message[];
  webSearchEnabled: boolean;
  messagesEndRef: MutableRefObject<HTMLDivElement | null>;
  scrollAreaRef: MutableRefObject<HTMLDivElement | null>;
  handleSubmit: (e?: React.FormEvent, query?: string) => void;
  toggleWebSearch: () => void;
  isOnline: boolean;
}
