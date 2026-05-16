import {Controller, Post, Body, Param, HttpCode, HttpStatus, ParseIntPipe} from '@nestjs/common';
import {DigestsService} from '../digests/digests.service';
import {
  ImportVideoDto,
  ImportVideoResponseDto,
  CreateDigestResponseDto,
  AskVideoDto,
  AskVideoResponseDto
} from './types/videos.dtos';
import {VideoImportService} from './video-import.service';
import {VideoQAService} from './video-qa.service';

@Controller('videos')
export class VideosController {
  constructor(
    private readonly videoImportService: VideoImportService,
    private readonly digestsService: DigestsService,
    private readonly videoQAService: VideoQAService
  ) {}

  @Post('import')
  @HttpCode(HttpStatus.OK)
  async importVideo(@Body() importVideoDto: ImportVideoDto): Promise<ImportVideoResponseDto> {
    return this.videoImportService.importVideo(importVideoDto);
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
    return this.videoQAService.askVideoQuestion(videoId, askVideoDto.question);
  }
}
