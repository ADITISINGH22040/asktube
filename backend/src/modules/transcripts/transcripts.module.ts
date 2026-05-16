import {Module} from '@nestjs/common';
import {SequelizeModule} from '@nestjs/sequelize';
import {Transcript} from '../../common/models/transcript.model';
import {TranscriptChunk} from '../../common/models/transcript-chunk.model';
import {EmbeddingService} from './embedding.service';
import {TranscriptService} from './transcript.service';
import {TranscriptsRepository} from './transcripts.repository';

@Module({
  imports: [SequelizeModule.forFeature([Transcript, TranscriptChunk])],
  providers: [TranscriptsRepository, TranscriptService, EmbeddingService],
  exports: [TranscriptsRepository, TranscriptService, EmbeddingService]
})
export class TranscriptsModule {}
