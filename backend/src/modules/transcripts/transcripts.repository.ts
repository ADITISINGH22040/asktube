import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/sequelize';
import {Optional, QueryTypes, Transaction} from 'sequelize';
import {Sequelize} from 'sequelize-typescript';
import {Transcript} from '../../common/models/transcript.model';
import {TranscriptChunk} from '../../common/models/transcript-chunk.model';

@Injectable()
export class TranscriptsRepository {
  constructor(
    @InjectModel(Transcript)
    private readonly transcriptModel: typeof Transcript,
    @InjectModel(TranscriptChunk)
    private readonly transcriptChunkModel: typeof TranscriptChunk,
    private readonly sequelize: Sequelize
  ) {}

  async createTranscript(values: Optional<Transcript, any>): Promise<Transcript> {
    return this.transcriptModel.create(values, {raw: true});
  }

  async findTranscriptByVideoId(videoId: number): Promise<Transcript | null> {
    return this.transcriptModel.findOne({
      where: {videoId}
    });
  }

  async createTranscriptChunks(
    chunks: Optional<TranscriptChunk, any>[]
  ): Promise<TranscriptChunk[]> {
    return this.transcriptChunkModel.bulkCreate(chunks, {returning: true});
  }

  async findTranscriptChunksByVideoId(videoId: number): Promise<TranscriptChunk[]> {
    return this.transcriptChunkModel.findAll({
      where: {videoId},
      order: [['chunkIndex', 'ASC']]
    });
  }

  async deleteTranscriptChunksByVideoId(videoId: number, transaction?: Transaction): Promise<number> {
    return this.transcriptChunkModel.destroy({
      where: {videoId},
      transaction
    });
  }

  async findSimilarTranscriptChunks(
    videoId: number,
    queryEmbedding: number[],
    limit: number = 8
  ): Promise<TranscriptChunk[]> {
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

    return rawResults.map((row: any) => {
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
  }
}
