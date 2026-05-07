export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: RetrievedSource[];
  timestamp: string;
  isStreaming?: boolean;
}

export interface RetrievedSource {
  chunkText: string;
  score: number;
  pageNumber: number;
  chunkIndex: number;
  fileName: string;
}

export interface ChatRequest {
  query: string;
  documentId: string;
}

export interface ChatResponse {
  answer: string;
  sources: RetrievedSource[];
}
