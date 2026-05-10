import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {databaseConfig, httpConfig} from '../../config/app.conf';
import {ollamaConfig} from '../../config/ollama.conf';
import {DatabaseModule} from '../database/database.module';
import {HealthModule} from '../health/health.module';
import {OllamaModule} from '../ollama/ollama.module';
import {VideosModule} from '../videos/videos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => ({http: httpConfig()}), () => ({database: databaseConfig()}), ollamaConfig]
    }),
    DatabaseModule,
    HealthModule,
    OllamaModule,
    VideosModule
  ]
})
export class AppModule {}
