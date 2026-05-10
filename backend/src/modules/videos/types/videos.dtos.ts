import {IsString, IsNotEmpty, IsUrl} from 'class-validator';

export class ImportVideoDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url: string;
}

export class VideoResponseDto {
  id: number;
  youtubeId: string;
  url: string;
  title: string;
  channelName: string;
  thumbnailUrl?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ImportVideoResponseDto {
  videoId: number;
  status: string;
  title: string;
}

export class CreateDigestResponseDto {
  videoId: number;
  contentMarkdown: string;
}

export class AskVideoDto {
  @IsString()
  @IsNotEmpty()
  question: string;
}

export class AskVideoResponseDto {
  answer: string;
  sources: Array<{
    chunkIndex: number;
    startSec?: number;
    endSec?: number;
  }>;
}

export class VideoTooLongErrorDto {
  error: string;
  message: string;
  maxVideoLengthMinutes: number;
}
