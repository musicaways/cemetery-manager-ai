
import { MutableRefObject } from "react";
import type { Cimitero } from "@/pages/cimiteri/types";

export interface ChatMessage {
  type: 'query' | 'response';
  content: string;
  data?: any;
  timestamp?: Date;
}

export interface UseChatReturn {
  query: string;
  setQuery: (query: string) => void;
  isProcessing: boolean;
  messages: ChatMessage[];
  webSearchEnabled: boolean;
  messagesEndRef: MutableRefObject<HTMLDivElement | null>;
  scrollAreaRef: MutableRefObject<HTMLDivElement | null>;
  handleSubmit: (e?: React.FormEvent, query?: string) => void;
  toggleWebSearch: () => void;
  isOnline: boolean;
}
