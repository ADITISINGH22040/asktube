import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig, httpConfig } from '../../config/app.conf';
import { openaiConfig } from '../../config/openai.conf';
import { DatabaseModule } from '../database/database.module';
import { HealthModule } from '../health/health.module';
import { OpenAIModule } from '../openai/openai.module';
import { VideosModule } from '../videos/videos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        () => ({ http: httpConfig() }),
        () => ({ database: databaseConfig() }),
        openaiConfig
      ]
    }),
    DatabaseModule,
    HealthModule,
    OpenAIModule,
    VideosModule
  ]
})
export class AppModule {}
