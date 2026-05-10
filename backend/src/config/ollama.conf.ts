import { registerAs } from '@nestjs/config';

export interface OllamaConfig {
  baseUrl: string;
  embeddingModel: string;
  chatModel: string;
  fallbackChatModel: string;
  embeddingDimension: number;
}

export const ollamaConfig = registerAs('ollama', (): OllamaConfig => ({
  baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  embeddingModel: process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text',
  chatModel: process.env.OLLAMA_CHAT_MODEL || 'llama3.2:3b',
  fallbackChatModel: process.env.OLLAMA_FALLBACK_CHAT_MODEL || 'gemma3:4b',
  embeddingDimension: parseInt(process.env.EMBEDDING_DIMENSION || '768'),
}));
