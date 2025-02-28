
export interface Message {
  type: "query" | "response";
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  data?: any;
  suggestedQuestions?: string[];
}

export type ChatMessage = Message;

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface CimiteriResult {
  cimiteri: any[];
}
