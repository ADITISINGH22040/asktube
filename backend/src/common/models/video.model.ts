import {Table, Column, Model, DataType, HasMany} from 'sequelize-typescript';
import {Transcript} from './transcript.model';
import {TranscriptChunk} from './transcript-chunk.model';
import {Digest} from './digest.model';

export enum VideoStatus {
  IMPORTING = 'IMPORTING',
  READY = 'READY',
  FAILED = 'FAILED'
}

@Table({
  tableName: 'videos',
  indexes: [
    {
      unique: true,
      fields: ['youtubeId'],
      name: 'videos_youtube_id_unique'
    }
  ]
})
export class Video extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true
  })
  youtubeId!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  url!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  title!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  channelName!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  thumbnailUrl?: string;

  @Column({
    type: DataType.ENUM(...Object.values(VideoStatus)),
    allowNull: false,
    defaultValue: VideoStatus.IMPORTING
  })
  status!: VideoStatus;

  @HasMany(() => Transcript)
  transcripts!: Transcript[];

  @HasMany(() => TranscriptChunk)
  transcriptChunks!: TranscriptChunk[];

  @HasMany(() => Digest)
  digests!: Digest[];
}
