
import type { Cimitero } from "@/pages/cimiteri/types";

export interface ChatMessage {
  type: 'query' | 'response';
  content: string;
  data?: any;
  timestamp?: Date;
}

export interface ChatState {
  query: string;
  isProcessing: boolean;
  messages: ChatMessage[];
  webSearchEnabled: boolean;
  selectedCimitero: Cimitero | null;
}

export interface UseChatReturn extends ChatState {
  setQuery: (query: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
  setSelectedCimitero: (cimitero: Cimitero | null) => void;
  handleSearch: (searchText: string) => void;
  handleSubmit: (e?: React.FormEvent, submittedQuery?: string) => Promise<void>;
  toggleWebSearch: () => void;
}
