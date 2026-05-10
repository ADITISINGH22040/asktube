import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { openaiConfig } from '../../config/openai.conf';
import { OpenAIService } from '../../common/services/openai.service';

@Module({
  imports: [ConfigModule.forFeature(openaiConfig)],
  providers: [OpenAIService],
  exports: [OpenAIService],
})
export class OpenAIModule {}
