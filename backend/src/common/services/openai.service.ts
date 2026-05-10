import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { OpenAIConfig } from '../../config/openai.conf';

@Injectable()
export class OpenAIService {
  private readonly openai: OpenAI;

  constructor(private readonly configService: ConfigService) {
    const openaiConfig = this.configService.get<OpenAIConfig>('openai');
    
    if (!openaiConfig?.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.openai = new OpenAI({
      apiKey: openaiConfig.apiKey,
    });
  }

  async createEmbedding(text: string | string[]): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: Array.isArray(text) ? text : [text],
    });

    return response.data[0].embedding;
  }

  async createChatCompletion(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: options?.model || 'gpt-4',
      messages,
      temperature: options?.temperature || 0.7,
      max_tokens: options?.maxTokens || 1000,
    });

    return response.choices[0].message.content || '';
  }
}
