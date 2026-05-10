// API Types based on backend DTOs
export interface ImportVideoRequest {
  url: string;
}

export interface ImportVideoResponse {
  videoId: number;
  status: string;
  title: string;
}

export interface CreateDigestResponse {
  videoId: number;
  contentMarkdown: string;
}

export interface AskVideoRequest {
  question: string;
}

export interface AskVideoResponse {
  answer: string;
  sources: Array<{
    chunkIndex: number;
    startSec?: number;
    endSec?: number;
  }>;
}

// Error types
export interface ApiError {
  message: string;
  error?: string;
  details?: any;
}

// Chat message type for the Ask AI tab
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{
    chunkIndex: number;
    startSec?: number;
    endSec?: number;
  }>;
}
