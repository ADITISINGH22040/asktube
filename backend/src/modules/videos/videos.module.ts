import {Module, forwardRef} from '@nestjs/common';
import {SequelizeModule} from '@nestjs/sequelize';
import {Video} from '../../common/models/video.model';
import {DigestsModule} from '../digests/digests.module';
import {OllamaModule} from '../ollama/ollama.module';
import {TranscriptsModule} from '../transcripts/transcripts.module';
import {VideoImportService} from './video-import.service';
import {VideoQAService} from './video-qa.service';
import {VideosController} from './videos.controller';
import {VideosRepository} from './videos.repository';

@Module({
  imports: [
    SequelizeModule.forFeature([Video]),
    TranscriptsModule,
    forwardRef(() => DigestsModule),
    OllamaModule
  ],
  controllers: [VideosController],
  providers: [VideosRepository, VideoImportService, VideoQAService],
  exports: [VideosRepository]
})
export class VideosModule {}
