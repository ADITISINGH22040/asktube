import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Ollama} from 'ollama';

@Injectable()
export class OllamaService {
  private readonly ollama: Ollama;
  private readonly chatModel: string;
  private readonly fallbackChatModel: string;

  constructor(private readonly configService: ConfigService) {
    this.ollama = new Ollama({
      host: this.configService.get<string>('OLLAMA_BASE_URL') || 'http://localhost:11434'
    });
    this.chatModel = this.configService.get<string>('OLLAMA_CHAT_MODEL') || 'llama3.2:3b';
    this.fallbackChatModel =
      this.configService.get<string>('OLLAMA_FALLBACK_CHAT_MODEL') || 'gemma3:4b';
  }

  async createEmbedding(text: string | string[]): Promise<number[]> {
    try {
      const response = await this.ollama.embed({
        model: this.configService.get<string>('OLLAMA_EMBEDDING_MODEL') || 'nomic-embed-text',
        input: Array.isArray(text) ? text : [text]
      });

      return response.embeddings[0];
    } catch (error: any) {
      // Check if Ollama is not running
      if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
        throw new Error('Ollama is not running. Start it with: ollama serve');
      }
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  async createChatCompletion(
    messages: Array<{role: 'system' | 'user' | 'assistant'; content: string}>,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    const model = options?.model || this.chatModel;

    try {
      const response = await this.ollama.chat({
        model,
        messages,
        stream: false,
        options: {
          temperature: options?.temperature || 0.7,
          num_predict: options?.maxTokens || 1000
        }
      });

      return response.message.content;
    } catch (error: any) {
      // Check if Ollama is not running
      if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
        throw new Error('Ollama is not running. Start it with: ollama serve');
      }

      // If using primary model failed and it's not a custom model, try fallback
      if (model === this.chatModel && !options?.model) {
        try {
          const fallbackResponse = await this.ollama.chat({
            model: this.fallbackChatModel,
            messages,
            stream: false,
            options: {
              temperature: options?.temperature || 0.7,
              num_predict: options?.maxTokens || 1000
            }
          });

          return fallbackResponse.message.content;
        } catch (fallbackError: any) {
          throw new Error(
            `Failed to generate chat completion with both primary (${this.chatModel}) and fallback (${this.fallbackChatModel}) models. Primary error: ${error.message}. Fallback error: ${fallbackError.message}`
          );
        }
      }

      throw new Error(`Failed to generate chat completion: ${error.message}`);
    }
  }
}
