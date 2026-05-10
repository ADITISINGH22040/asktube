import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig, httpConfig } from '../../config/app.conf';
import { openaiConfig } from '../../config/openai.conf';
import { DatabaseModule } from '../database/database.module';
import { HealthModule } from '../health/health.module';
import { OpenAIModule } from '../openai/openai.module';
import { UsersModule } from '../users/users.module';

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
    UsersModule
  ]
})
export class AppModule {}
