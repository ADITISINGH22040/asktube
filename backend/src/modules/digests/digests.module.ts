import {Module, forwardRef} from '@nestjs/common';
import {SequelizeModule} from '@nestjs/sequelize';
import {Digest} from '../../common/models/digest.model';
import {OllamaModule} from '../ollama/ollama.module';
import {TranscriptsModule} from '../transcripts/transcripts.module';
import {VideosModule} from '../videos/videos.module';
import {DigestsRepository} from './digests.repository';
import {DigestsService} from './digests.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Digest]),
    TranscriptsModule,
    forwardRef(() => VideosModule),
    OllamaModule
  ],
  providers: [DigestsRepository, DigestsService],
  exports: [DigestsService]
})
export class DigestsModule {}
