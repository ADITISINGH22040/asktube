import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Optional, QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { withTransaction } from '../../common/db/transaction-helper';
import { Video, VideoStatus } from '../../common/models/video.model';
import { Transcript } from '../../common/models/transcript.model';
import { TranscriptChunk } from '../../common/models/transcript-chunk.model';
import { Digest } from '../../common/models/digest.model';

@Injectable()
export class VideosRepository {
  private readonly videoAttributes: string[] = [
    'id',
    'youtubeId',
    'url',
    'title',
    'channelName',
    'thumbnailUrl',
    'status',
    'createdAt',
    'updatedAt'
  ];

  constructor(
    @InjectModel(Video)
    private readonly videoModel: typeof Video,
    @InjectModel(Transcript)
    private readonly transcriptModel: typeof Transcript,
    @InjectModel(TranscriptChunk)
    private readonly transcriptChunkModel: typeof TranscriptChunk,
    @InjectModel(Digest)
    private readonly digestModel: typeof Digest,
    private readonly sequelize: Sequelize
  ) {}

  async findByYoutubeId(youtubeId: string): Promise<Video | null> {
    return this.videoModel.findOne({
      where: {youtubeId},
      attributes: this.videoAttributes
    });
  }

  async createVideo(values: Optional<Video, any>): Promise<Video> {
    return this.videoModel.create(values, {raw: true});
  }

  async updateVideoStatus(id: number, status: VideoStatus): Promise<Video | null> {
    return withTransaction<Video | null>(this.sequelize, async (transaction) => {
      const video = await this.videoModel.findOne({
        where: {id},
        transaction
      });

      if (!video) {
        return null;
      }

      const updatedVideo = await video.update({status}, {transaction, returning: true});
      return updatedVideo;
    });
  }

  async createTranscript(values: Optional<Transcript, any>): Promise<Transcript> {
    return this.transcriptModel.create(values, {raw: true});
  }

  async createTranscriptChunks(
    chunks: Optional<TranscriptChunk, any>[]
  ): Promise<TranscriptChunk[]> {
    return this.transcriptChunkModel.bulkCreate(chunks, {returning: true});
  }

  async findTranscriptByVideoId(videoId: number): Promise<Transcript | null> {
    return this.transcriptModel.findOne({
      where: {videoId}
    });
  }

  async findTranscriptChunksByVideoId(videoId: number): Promise<TranscriptChunk[]> {
    return this.transcriptChunkModel.findAll({
      where: {videoId},
      order: [['chunkIndex', 'ASC']]
    });
  }

  async deleteTranscriptChunksByVideoId(videoId: number, transaction?: any): Promise<number> {
    return this.transcriptChunkModel.destroy({
      where: {videoId},
      transaction
    });
  }

  async findDigestByVideoId(videoId: number): Promise<Digest | null> {
    return this.digestModel.findOne({
      where: {videoId}
    });
  }

  async upsertDigest(videoId: number, contentMarkdown: string): Promise<Digest> {
    return withTransaction<Digest>(this.sequelize, async (transaction) => {
      const existingDigest = await this.digestModel.findOne({
        where: {videoId},
        transaction
      });

      if (existingDigest) {
        await existingDigest.update({contentMarkdown}, {transaction});
        await existingDigest.reload();
        return existingDigest;
      } else {
        return this.digestModel.create(
          {
            videoId,
            contentMarkdown
          },
          {transaction}
        );
      }
    });
  }

  async findVideoById(videoId: number): Promise<Video | null> {
    return this.videoModel.findOne({
      where: {id: videoId},
      attributes: this.videoAttributes
    });
  }

  async findSimilarTranscriptChunks(
    videoId: number,
    queryEmbedding: number[],
    limit: number = 8
  ): Promise<TranscriptChunk[]> {
    // Use raw SQL for pgvector cosine similarity search
    const query = `
      SELECT 
        tc.*,
        1 - (tc.embedding <=> :queryEmbedding) as similarity
      FROM transcript_chunks tc
      WHERE tc."videoId" = :videoId
        AND tc.embedding IS NOT NULL
      ORDER BY tc.embedding <=> :queryEmbedding
      LIMIT :limit
    `;

    const rawResults = await this.sequelize.query(query, {
      replacements: {
        videoId,
        queryEmbedding: `[${queryEmbedding.join(',')}]`,
        limit
      },
      type: QueryTypes.SELECT
    });

    // Manually construct TranscriptChunk objects from raw results
    const results = rawResults.map((row: any) => {
      const chunk = new TranscriptChunk();
      chunk.id = row.id;
      chunk.videoId = row.videoId;
      chunk.transcriptId = row.transcriptId;
      chunk.chunkIndex = row.chunkIndex;
      chunk.startSec = row.startSec;
      chunk.endSec = row.endSec;
      chunk.content = row.content;
      chunk.embedding = row.embedding;
      chunk.createdAt = row.createdAt;
      chunk.updatedAt = row.updatedAt;
      return chunk;
    });

    return results;
  }
}
