import {Injectable} from '@nestjs/common';
import {fetchTranscript, TranscriptSegment} from 'youtube-transcript-plus';
import {TranscriptNotFoundError} from './errors/transcript-not-found.error';
import {UnsupportedVideoError} from './errors/unsupported-video.error';

export interface TranscriptData {
  rawText: string;
  snippets: Array<{
    text: string;
    startSec?: number;
    endSec?: number;
  }>;
  language: string;
}

@Injectable()
export class TranscriptService {
  async fetchTranscriptData(youtubeId: string): Promise<TranscriptData> {
    try {
      const response = await fetchTranscript(youtubeId, {
        lang: 'en',
        videoDetails: true
      });

      // Handle different response structures
      let segments: TranscriptSegment[];
      if (Array.isArray(response)) {
        // Direct array of segments
        segments = response;
      } else if (
        response &&
        (response as any).segments &&
        Array.isArray((response as any).segments)
      ) {
        // Response with videoDetails and segments
        segments = (response as any).segments;
      } else {
        throw new TranscriptNotFoundError(youtubeId);
      }

      if (!segments || segments.length === 0) {
        throw new TranscriptNotFoundError(youtubeId);
      }

      // Extract language from first segment
      const language = segments[0] && segments[0].lang ? segments[0].lang : 'en';

      // Create raw text by joining all segments
      const rawText = segments
        .filter((segment) => segment && segment.text)
        .map((segment) => segment.text)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Create snippets with timing information
      const snippets = segments
        .filter((segment) => segment && segment.text)
        .map((segment) => ({
          text: segment.text,
          startSec: segment.offset,
          endSec: segment.offset ? segment.offset + (segment.duration || 0) : undefined
        }));

      return {
        rawText,
        snippets,
        language
      };
    } catch (error: any) {
      // Handle specific transcript errors
      if (
        error.message?.includes('No transcript available') ||
        error.message?.includes('captions') ||
        error.message?.includes('transcript')
      ) {
        throw new TranscriptNotFoundError(youtubeId);
      }

      // Handle invalid video ID or unsupported video
      if (
        error.message?.includes('Invalid video id') ||
        error.message?.includes('Video not found') ||
        error.message?.includes('Unsupported video')
      ) {
        throw new UnsupportedVideoError(youtubeId);
      }

      // Re-throw other errors
      throw error;
    }
  }

  chunkTranscript(
    transcriptData: TranscriptData,
    chunkSize: number = 500,
    overlap: number = 50
  ): Array<{
    content: string;
    startSec?: number;
    endSec?: number;
  }> {
    const {snippets} = transcriptData;
    const chunks: Array<{
      content: string;
      startSec?: number;
      endSec?: number;
    }> = [];

    if (snippets.length === 0) {
      return chunks;
    }

    let currentChunk = '';
    let currentStartSec: number | undefined;
    let currentEndSec: number | undefined;
    let snippetIndex = 0;

    while (snippetIndex < snippets.length) {
      const snippet = snippets[snippetIndex];
      const snippetText = snippet.text;

      // If adding this snippet would exceed chunk size and we already have content, create a chunk
      if (currentChunk && currentChunk.length + snippetText.length > chunkSize) {
        chunks.push({
          content: currentChunk.trim(),
          startSec: currentStartSec,
          endSec: currentEndSec
        });

        // Start new chunk with overlap
        const words = currentChunk.split(' ');
        const overlapWords = words.slice(-Math.min(overlap, words.length));
        currentChunk = overlapWords.join(' ') + ' ' + snippetText;
        currentStartSec = snippet.startSec;
        currentEndSec = snippet.endSec;
      } else {
        // Add snippet to current chunk
        if (!currentChunk) {
          currentChunk = snippetText;
          currentStartSec = snippet.startSec;
        } else {
          currentChunk += ' ' + snippetText;
        }
        currentEndSec = snippet.endSec;
      }

      snippetIndex++;
    }

    // Add final chunk if there's remaining content
    if (currentChunk.trim()) {
      chunks.push({
        content: currentChunk.trim(),
        startSec: currentStartSec,
        endSec: currentEndSec
      });
    }

    return chunks;
  }
}
