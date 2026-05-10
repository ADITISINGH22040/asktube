import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {ollamaConfig} from '../../config/ollama.conf';
import {OllamaService} from '../../common/services/ollama.service';

@Module({
  imports: [ConfigModule.forFeature(ollamaConfig)],
  providers: [OllamaService],
  exports: [OllamaService]
})
export class OllamaModule {}
