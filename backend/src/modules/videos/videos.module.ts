import {Module, forwardRef} from '@nestjs/common';
import {SequelizeModule} from '@nestjs/sequelize';
import {Video} from '../../common/models/video.model';
import {DigestsModule} from '../digests/digests.module';
import {OllamaModule} from '../ollama/ollama.module';
import {TranscriptsModule} from '../transcripts/transcripts.module';
import {VideosController} from './videos.controller';
import {VideosRepository} from './videos.repository';
import {VideosService} from './videos.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Video]),
    TranscriptsModule,
    forwardRef(() => DigestsModule),
    OllamaModule
  ],
  controllers: [VideosController],
  providers: [VideosRepository, VideosService],
  exports: [VideosRepository]
})
export class VideosModule {}
