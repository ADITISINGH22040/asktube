import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

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
