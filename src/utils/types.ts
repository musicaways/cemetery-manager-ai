
export interface AIResponse {
  text: string;
  data?: any;
  error?: string;
}

export interface QueryRequest {
  query: string;
  queryType: 'test' | 'database' | 'web';
  isTest?: boolean;
  aiProvider?: string;
  aiModel?: string;
}
