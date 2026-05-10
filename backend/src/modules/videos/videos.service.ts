import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { withTransaction } from '../../common/db/transaction-helper';
import { Video, VideoStatus } from '../../common/models/video.model';
import { Transcript } from '../../common/models/transcript.model';
import { TranscriptChunk } from '../../common/models/transcript-chunk.model';
import { YouTubeUrlParser } from './utils/youtube-url-parser.util';
import { VideosRepository } from './videos.repository';
import { TranscriptService, TranscriptData } from './transcript.service';
import { EmbeddingService } from './embedding.service';
import { ImportVideoDto, ImportVideoResponseDto } from './types/videos.dtos';
import { fetchTranscript } from 'youtube-transcript-plus';
import { UnsupportedVideoError } from './errors/unsupported-video.error';

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
    private readonly transcriptService: TranscriptService,
    private readonly embeddingService: EmbeddingService,
    private readonly sequelize: Sequelize,
  ) {}

  async importVideo(importVideoDto: ImportVideoDto): Promise<ImportVideoResponseDto> {
    const { url } = importVideoDto;

    // Extract YouTube ID robustly
    let youtubeId: string;
    try {
      youtubeId = YouTubeUrlParser.extractYoutubeId(url);
    } catch (error: any) {
      throw new UnsupportedVideoError(url);
    }

    // Check if video already exists with status READY
    const existingVideo = await this.videosRepository.findByYoutubeId(youtubeId);
    if (existingVideo && existingVideo.status === VideoStatus.READY) {
      return {
        videoId: existingVideo.id,
        status: existingVideo.status,
        title: existingVideo.title,
      };
    }

    // Create or update video with IMPORTING status
    let video: Video;
    if (existingVideo) {
      const updatedVideo = await this.videosRepository.updateVideoStatus(existingVideo.id, VideoStatus.IMPORTING);
      if (!updatedVideo) {
        throw new Error('Failed to update video status');
      }
      video = updatedVideo;
    } else {
      // Fetch basic video metadata
      const metadata = await this.fetchVideoMetadata(youtubeId);
      video = await this.videosRepository.createVideo({
        youtubeId,
        url,
        title: metadata.title,
        channelName: metadata.author,
        thumbnailUrl: this.getBestThumbnail(metadata.thumbnails),
        status: VideoStatus.IMPORTING,
      });
    }

    try {
      // Fetch transcript and process it
      const transcriptData = await this.transcriptService.fetchTranscriptData(youtubeId);

      // Process everything in a transaction
      const result = await withTransaction(
        this.sequelize,
        async (transaction) => {
          // Check if transcript already exists
          let transcript = await this.videosRepository.findTranscriptByVideoId(video.id);
          
          if (transcript) {
            // Update existing transcript
            await transcript.update({
              language: transcriptData.language,
              rawText: transcriptData.rawText,
            }, { transaction });
          } else {
            // Create new transcript record
            transcript = await this.videosRepository.createTranscript({
              videoId: video.id,
              language: transcriptData.language,
              rawText: transcriptData.rawText,
            });
          }

          // Chunk transcript into overlapping chunks
          const chunks = this.transcriptService.chunkTranscript(transcriptData);

          // Generate embeddings for chunks
          const chunkTexts = chunks.map(chunk => chunk.content);
          const embeddings = await this.embeddingService.generateEmbeddings(chunkTexts);

          // Delete existing transcript chunks for this video
          await this.videosRepository.deleteTranscriptChunksByVideoId(video.id, transaction);

          // Create transcript chunks with embeddings
          const transcriptChunks = chunks.map((chunk, index) => ({
            videoId: video.id,
            transcriptId: transcript.id,
            chunkIndex: index,
            startSec: chunk.startSec,
            endSec: chunk.endSec,
            content: chunk.content,
            embedding: embeddings[index],
          }));

          await this.videosRepository.createTranscriptChunks(transcriptChunks);

          // Update video status to READY
          const updatedVideo = await this.videosRepository.updateVideoStatus(
            video.id,
            VideoStatus.READY
          );

          return updatedVideo;
        }
      );

      if (!result) {
        throw new Error('Failed to process video');
      }

      return {
        videoId: result.id,
        status: result.status,
        title: result.title,
      };
    } catch (error: any) {
      // Mark video as FAILED on any error
      await this.videosRepository.updateVideoStatus(video.id, VideoStatus.FAILED);
      throw error;
    }
  }

  private async fetchVideoMetadata(youtubeId: string): Promise<VideoMetadata> {
    try {
      // Use youtube-transcript-plus with videoDetails to get metadata
      const result = await fetchTranscript(youtubeId, {
        videoDetails: true,
      });
      console.log("Metadata result:", result)

      // The result structure depends on the library version
      if (Array.isArray(result)) {
        // If it's just segments, we need to extract minimal metadata
        throw new Error('Unable to fetch video metadata');
      }

      const videoDetails = (result as any).videoDetails;
      if (!videoDetails) {
        throw new Error('Unable to fetch video metadata');
      }

      return videoDetails;
    } catch (error: any) {
      // Fallback to basic metadata if transcript fetching fails
      return {
        title: `YouTube Video ${youtubeId}`,
        author: 'Unknown Channel',
        channelId: '',
        thumbnails: {},
        lengthSeconds: 0,
        viewCount: 0,
        description: '',
        keywords: [],
        isLiveContent: false,
      };
    }
  }

  private getBestThumbnail(thumbnails: any): string | undefined {
    if (!thumbnails || typeof thumbnails !== 'object') {
      return undefined;
    }

    // Try to find the highest quality thumbnail
    const thumbnailEntries = Object.entries(thumbnails);
    if (thumbnailEntries.length === 0) {
      return undefined;
    }

    // Sort by resolution (assuming format like 'maxres', 'high', 'medium', 'default')
    const prioritizedKeys = ['maxres', 'high', 'medium', 'default', 'standard'];
    
    for (const key of prioritizedKeys) {
      const thumbnail = thumbnails[key];
      if (thumbnail && typeof thumbnail === 'object' && thumbnail.url) {
        return thumbnail.url;
      }
    }

    // Fallback to first available thumbnail
    const firstThumbnail = thumbnailEntries[0]?.[1];
    if (firstThumbnail && typeof firstThumbnail === 'object' && (firstThumbnail as any).url) {
      return (firstThumbnail as any).url;
    }
    
    // If it's a string directly, return it
    if (typeof firstThumbnail === 'string') {
      return firstThumbnail;
    }

    return undefined;
  }
}
