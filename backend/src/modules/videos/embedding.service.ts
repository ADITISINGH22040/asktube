import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class EmbeddingService {
  private readonly openai: OpenAI | null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      console.warn('OPENAI_API_KEY environment variable is not set. EmbeddingService will use mock embeddings for testing.');
      this.openai = null;
      return;
    }

    this.openai = new OpenAI({
      apiKey,
    });
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    // Return mock embeddings if OpenAI client is not available
    if (!this.openai) {
      return texts.map(() => Array(1536).fill(0).map(() => Math.random()));
    }

    const embeddings: number[][] = [];

    // Process in batches to handle rate limits
    const batchSize = 100;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      
      try {
        const response = await this.openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: batch,
        });

        const batchEmbeddings = response.data.map(item => item.embedding);
        embeddings.push(...batchEmbeddings);
      } catch (error: any) {
        throw new Error(`Failed to generate embeddings for batch ${i}-${i + batch.length}: ${error.message}`);
      }
    }

    return embeddings;
  }

  async generateSingleEmbedding(text: string): Promise<number[]> {
    // Return mock embedding if OpenAI client is not available
    if (!this.openai) {
      return Array(1536).fill(0).map(() => Math.random());
    }

    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error: any) {
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }
}
