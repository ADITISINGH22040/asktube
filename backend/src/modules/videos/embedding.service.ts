import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Ollama} from 'ollama';

@Injectable()
export class EmbeddingService {
  private readonly ollama: Ollama;
  private readonly embeddingModel: string;

  constructor(private readonly configService: ConfigService) {
    this.ollama = new Ollama({
      host: this.configService.get<string>('OLLAMA_BASE_URL') || 'http://localhost:11434'
    });
    this.embeddingModel =
      this.configService.get<string>('OLLAMA_EMBEDDING_MODEL') || 'nomic-embed-text';
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await this.ollama.embed({
        model: this.embeddingModel,
        input: texts
      });
      return response.embeddings;
    } catch (error: any) {
      // Check if Ollama is not running
      if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
        throw new Error('Ollama is not running. Start it with: ollama serve');
      }
      throw new Error(`Failed to generate embeddings: ${error.message}`);
    }
  }

  async generateSingleEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.ollama.embed({
        model: this.embeddingModel,
        input: text
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
}
