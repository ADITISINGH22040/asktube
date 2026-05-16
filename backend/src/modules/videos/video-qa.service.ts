import {Injectable} from '@nestjs/common';
import {TranscriptChunk} from '../../common/models/transcript-chunk.model';
import {OllamaService} from '../../common/services/ollama.service';
import {EmbeddingService} from '../transcripts/embedding.service';
import {TranscriptsRepository} from '../transcripts/transcripts.repository';
import {VideosRepository} from './videos.repository';

@Injectable()
export class VideoQAService {
  constructor(
    private readonly videosRepository: VideosRepository,
    private readonly transcriptsRepository: TranscriptsRepository,
    private readonly embeddingService: EmbeddingService,
    private readonly ollamaService: OllamaService
  ) {}

  async askVideoQuestion(
    videoId: number,
    question: string
  ): Promise<{
    answer: string;
  }> {
    const video = await this.videosRepository.findVideoById(videoId);
    if (!video) {
      throw new Error('Video not found');
    }

    const questionEmbedding = await this.embeddingService.generateSingleEmbedding(question);

    const dynamicLimit = Math.min(Math.max(5, Math.floor(question.length / 10)), 8);

    const relevantChunks = await this.transcriptsRepository.findSimilarTranscriptChunks(
      videoId,
      questionEmbedding,
      dynamicLimit
    );

    if (relevantChunks.length === 0) {
      return {
        answer:
          'I apologize, but I could not find any relevant transcript segments to answer your question. This video may not have transcript data available.'
      };
    }

    const groundedPrompt = this.buildGroundedPrompt(question, relevantChunks);

    try {
      const answer = (await Promise.race([
        this.ollamaService.createChatCompletion(
          [
            {
              role: 'system',
              content: groundedPrompt.systemPrompt
            },
            {
              role: 'user',
              content: groundedPrompt.userPrompt
            }
          ],
          {
            temperature: 0.3,
            maxTokens: 1500
          }
        ),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Ollama request timeout')), 30000)
        )
      ])) as string;

      if (!answer) {
        throw new Error('Failed to generate answer');
      }

      return {answer};
    } catch (error: any) {
      if (error.message.includes('Ollama is not running')) {
        throw error;
      }
      if (error.message.includes('Ollama request timeout')) {
        throw new Error(
          'Ollama request timed out. Make sure Ollama is running and the required models are downloaded.'
        );
      }
      throw new Error(`Failed to generate answer: ${error.message}`);
    }
  }

  private buildGroundedPrompt(
    question: string,
    chunks: TranscriptChunk[]
  ): {systemPrompt: string; userPrompt: string} {
    const chunksText = chunks
      .map((chunk, index) => {
        const timestampInfo =
          chunk.startSec && chunk.endSec ? ` [${chunk.startSec}s - ${chunk.endSec}s]` : '';
        return `Chunk ${index + 1}${timestampInfo}:\n${chunk.content}`;
      })
      .join('\n\n');

    const systemPrompt = `You are an AI assistant that answers questions about video transcripts.

CRITICAL INSTRUCTIONS:
- Answer ONLY using the provided transcript chunks
- If the transcript chunks do not contain sufficient information to answer the question, explicitly state: "Based on the provided transcript segments, I don't have enough information to answer this question."
- Do not use any external knowledge or information not present in the chunks
- Be precise and provide specific information from the chunks when possible
- Keep answers concise but comprehensive
- If timestamps are provided, you can reference them to indicate when information was discussed
- Do NOT mention "Chunk", "chunks", or refer to chunk numbers in your answer

Your answer must be grounded entirely in the provided transcript content.`;

    const userPrompt = `Question: ${question}

Transcript Chunks:
${chunksText}

Please answer the question based only on the transcript chunks provided above.`;

    return {
      systemPrompt,
      userPrompt
    };
  }
}
