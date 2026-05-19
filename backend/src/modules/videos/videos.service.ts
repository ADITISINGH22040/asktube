import {Injectable} from '@nestjs/common';
import {Sequelize} from 'sequelize-typescript';
import {fetchTranscript} from 'youtube-transcript-plus';
import {withTransaction} from '../../common/db/transaction-helper';
import {TranscriptChunk} from '../../common/models/transcript-chunk.model';
import {Video, VideoStatus} from '../../common/models/video.model';
import {OllamaService} from '../../common/services/ollama.service';
import {EmbeddingService} from '../transcripts/embedding.service';
import {TranscriptService} from '../transcripts/transcript.service';
import {TranscriptsRepository} from '../transcripts/transcripts.repository';
import {UnsupportedVideoError} from './errors/unsupported-video.error';
import {ImportVideoDto, ImportVideoResponseDto} from './types/videos.dtos';
import {YouTubeUrlParser} from './utils/youtube-url-parser.util';
import {VideosRepository} from './videos.repository';

interface VideoMetadata {
  title: string;
  author: string;
  channelId: string;
  thumbnails: any;
  lengthSeconds: number;
  viewCount: number;
  description: string;
  keywords: string[];
  isLiveContent: boolean;
}

@Injectable()
export class VideosService {
  constructor(
    private readonly videosRepository: VideosRepository,
    private readonly transcriptsRepository: TranscriptsRepository,
    private readonly transcriptService: TranscriptService,
    private readonly embeddingService: EmbeddingService,
    private readonly ollamaService: OllamaService,
    private readonly sequelize: Sequelize
  ) {}

  async importVideo(importVideoDto: ImportVideoDto): Promise<ImportVideoResponseDto> {
    const {url} = importVideoDto;

    let youtubeId: string;
    try {
      youtubeId = YouTubeUrlParser.extractYoutubeId(url);
    } catch {
      throw new UnsupportedVideoError(url);
    }

    const existingVideo = await this.videosRepository.findByYoutubeId(youtubeId);
    if (existingVideo && existingVideo.status === VideoStatus.READY) {
      return {
        videoId: existingVideo.id,
        status: existingVideo.status,
        title: existingVideo.title
      };
    }

    let video: Video;
    if (existingVideo) {
      const updatedVideo = await this.videosRepository.updateVideoStatus(
        existingVideo.id,
        VideoStatus.IMPORTING
      );
      if (!updatedVideo) {
        throw new Error('Failed to update video status');
      }
      video = updatedVideo;
    } else {
      const metadata = await this.fetchVideoMetadata(youtubeId);
      video = await this.videosRepository.createVideo({
        youtubeId,
        url,
        title: metadata.title,
        channelName: metadata.author,
        thumbnailUrl: this.getBestThumbnail(metadata.thumbnails),
        status: VideoStatus.IMPORTING
      });
    }

    try {
      const transcriptData = await this.transcriptService.fetchTranscriptData(youtubeId);

      const result = await withTransaction(this.sequelize, async (transaction) => {
        let transcript = await this.transcriptsRepository.findTranscriptByVideoId(video.id);

        if (transcript) {
          await transcript.update(
            {
              language: transcriptData.language,
              rawText: transcriptData.rawText
            },
            {transaction}
          );
        } else {
          transcript = await this.transcriptsRepository.createTranscript({
            videoId: video.id,
            language: transcriptData.language,
            rawText: transcriptData.rawText
          });
        }

        const chunks = this.transcriptService.chunkTranscript(transcriptData);
        const chunkTexts = chunks.map((chunk) => chunk.content);
        const embeddings = await this.embeddingService.generateEmbeddings(chunkTexts);

        await this.transcriptsRepository.deleteTranscriptChunksByVideoId(video.id, transaction);

        const transcriptChunks = chunks.map((chunk, index) => ({
          videoId: video.id,
          transcriptId: transcript.id,
          chunkIndex: index,
          startSec: chunk.startSec,
          endSec: chunk.endSec,
          content: chunk.content,
          embedding: embeddings[index]
        }));

        await this.transcriptsRepository.createTranscriptChunks(transcriptChunks);

        return this.videosRepository.updateVideoStatus(video.id, VideoStatus.READY, transaction);
      });

      if (!result) {
        throw new Error('Failed to process video');
      }

      return {
        videoId: result.id,
        status: result.status,
        title: result.title
      };
    } catch (error) {
      await this.videosRepository.updateVideoStatus(video.id, VideoStatus.FAILED);
      throw error;
    }
  }

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

  private async fetchVideoMetadata(youtubeId: string): Promise<VideoMetadata> {
    try {
      const result = await fetchTranscript(youtubeId, {
        videoDetails: true
      });

      if (Array.isArray(result)) {
        throw new Error('Unable to fetch video metadata');
      }

      const videoDetails = (result as any).videoDetails;
      if (!videoDetails) {
        throw new Error('Unable to fetch video metadata');
      }

      return videoDetails;
    } catch {
      return {
        title: `YouTube Video ${youtubeId}`,
        author: 'Unknown Channel',
        channelId: '',
        thumbnails: {},
        lengthSeconds: 0,
        viewCount: 0,
        description: '',
        keywords: [],
        isLiveContent: false
      };
    }
  }

  private getBestThumbnail(thumbnails: any): string | undefined {
    if (!thumbnails || typeof thumbnails !== 'object') {
      return undefined;
    }

    const thumbnailEntries = Object.entries(thumbnails);
    if (thumbnailEntries.length === 0) {
      return undefined;
    }

    const prioritizedKeys = ['maxres', 'high', 'medium', 'default', 'standard'];

    for (const key of prioritizedKeys) {
      const thumbnail = thumbnails[key];
      if (thumbnail && typeof thumbnail === 'object' && thumbnail.url) {
        return thumbnail.url;
      }
    }

    const firstThumbnail = thumbnailEntries[0]?.[1];
    if (firstThumbnail && typeof firstThumbnail === 'object' && (firstThumbnail as any).url) {
      return (firstThumbnail as any).url;
    }

    if (typeof firstThumbnail === 'string') {
      return firstThumbnail;
    }

    return undefined;
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
