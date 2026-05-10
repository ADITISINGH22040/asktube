import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Video } from '../../common/models/video.model';
import { Transcript } from '../../common/models/transcript.model';
import { TranscriptChunk } from '../../common/models/transcript-chunk.model';
import { EmbeddingService } from './embedding.service';
import { TranscriptService } from './transcript.service';
import { VideosController } from './videos.controller';
import { VideosRepository } from './videos.repository';
import { VideosService } from './videos.service';

@Module({
  imports: [SequelizeModule.forFeature([Video, Transcript, TranscriptChunk])],
  controllers: [VideosController],
  providers: [
    VideosRepository,
    VideosService,
    TranscriptService,
    EmbeddingService,
  ],
  exports: [VideosService, TranscriptService, EmbeddingService],
})
export class VideosModule {}
