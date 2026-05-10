import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ImportVideoDto, ImportVideoResponseDto } from './types/videos.dtos';
import { VideosService } from './videos.service';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post('import')
  @HttpCode(HttpStatus.OK)
  async importVideo(@Body() importVideoDto: ImportVideoDto): Promise<ImportVideoResponseDto> {
    return this.videosService.importVideo(importVideoDto);
  }
}
