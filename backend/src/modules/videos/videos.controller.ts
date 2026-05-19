import {Controller, Post, Body, Param, HttpCode, HttpStatus, ParseIntPipe} from '@nestjs/common';
import {DigestsService} from '../digests/digests.service';
import {
  ImportVideoDto,
  ImportVideoResponseDto,
  CreateDigestResponseDto,
  AskVideoDto,
  AskVideoResponseDto
} from './types/videos.dtos';
import {VideosService} from './videos.service';

@Controller('videos')
export class VideosController {
  constructor(
    private readonly videosService: VideosService,
    private readonly digestsService: DigestsService
  ) {}

  @Post('import')
  @HttpCode(HttpStatus.OK)
  async importVideo(@Body() importVideoDto: ImportVideoDto): Promise<ImportVideoResponseDto> {
    return this.videosService.importVideo(importVideoDto);
  }

  @Post(':videoId/digest')
  @HttpCode(HttpStatus.OK)
  async createDigest(
    @Param('videoId', ParseIntPipe) videoId: number
  ): Promise<CreateDigestResponseDto> {
    return this.digestsService.generateDigest(videoId);
  }

  @Post(':videoId/ask')
  @HttpCode(HttpStatus.OK)
  async askVideo(
    @Param('videoId', ParseIntPipe) videoId: number,
    @Body() askVideoDto: AskVideoDto
  ): Promise<AskVideoResponseDto> {
    return this.videosService.askVideoQuestion(videoId, askVideoDto.question);
  }
}
