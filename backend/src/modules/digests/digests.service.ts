import {Injectable} from '@nestjs/common';
import {OllamaService} from '../../common/services/ollama.service';
import {CreateDigestResponseDto} from '../videos/types/videos.dtos';
import {VideosRepository} from '../videos/videos.repository';
import {TranscriptsRepository} from '../transcripts/transcripts.repository';
import {VideoTooLongError} from './errors/video-too-long.error';
import {DigestsRepository} from './digests.repository';

@Injectable()
export class DigestsService {
  private readonly MVP_THRESHOLD_MINUTES = 30;

  constructor(
    private readonly videosRepository: VideosRepository,
    private readonly transcriptsRepository: TranscriptsRepository,
    private readonly digestsRepository: DigestsRepository,
    private readonly ollamaService: OllamaService
  ) {}

  async generateDigest(videoId: number): Promise<CreateDigestResponseDto> {
    const video = await this.videosRepository.findVideoById(videoId);
    if (!video) {
      throw new Error('Video not found');
    }

    const transcript = await this.transcriptsRepository.findTranscriptByVideoId(videoId);
    if (!transcript) {
      throw new Error('Transcript not found for this video');
    }

    const rawText = transcript.get('rawText') as string;

    if (!rawText || rawText.trim().length === 0) {
      throw new Error(
        `Video ${videoId} has a transcript record but no transcript content. The video may need to be re-imported to fetch the transcript data.`
      );
    }

    const digestContent = await this.generateDigestContent(rawText);
    const digest = await this.digestsRepository.upsertDigest(videoId, digestContent);

    return {
      videoId: digest.get('videoId') as number,
      contentMarkdown: digest.get('contentMarkdown') as string
    };
  }

  private async generateDigestContent(transcriptText: string): Promise<string> {
    const systemPrompt = `You are an expert at creating concise, informative summaries from video transcripts. 

Your task is to create a markdown digest that:
- Summarizes only from the transcript content provided
- Includes key takeaways and main points
- Includes optional timestamp references only if available in the retrieved text/snippets
- Avoids hallucinating anything not present in the transcript
- Outputs clean markdown suitable for direct rendering in a frontend

Format the output with:
- A brief overview (2-3 sentences)
- Key takeaways as bullet points
- Main topics/sections with subheadings if applicable
- Any important quotes or specific details mentioned

Be concise but comprehensive. Focus on the most valuable information.`;

    try {
      const content = (await Promise.race([
        this.ollamaService.createChatCompletion(
          [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: `Please create a digest of the following video transcript:\n\n${transcriptText}`
            }
          ],
          {
            temperature: 0.3,
            maxTokens: 2000
          }
        ),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Ollama request timeout')), 30000)
        )
      ])) as string;

      if (!content) {
        throw new Error('Failed to generate digest content');
      }

      return content;
    } catch (error: any) {
      if (error.message.includes('Ollama is not running')) {
        throw error;
      }
      if (error.message.includes('Ollama request timeout')) {
        throw new Error(
          'Ollama request timed out. Make sure Ollama is running and the required models are downloaded.'
        );
      }
      throw new Error(`Failed to generate digest: ${error.message}`);
    }
  }
}
