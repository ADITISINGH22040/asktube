import {Table, Column, Model, DataType, BelongsTo, ForeignKey} from 'sequelize-typescript';
import {Video} from './video.model';
import {Transcript} from './transcript.model';

@Table({
  tableName: 'transcript_chunks',
  indexes: [
    {
      fields: ['videoId', 'chunkIndex'],
      name: 'transcript_chunks_video_id_chunk_index'
    }
  ]
})
export class TranscriptChunk extends Model {
  @ForeignKey(() => Video)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  videoId!: number;

  @ForeignKey(() => Transcript)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  transcriptId!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  chunkIndex!: number;

  @Column({
    type: DataType.DECIMAL(10, 3),
    allowNull: true
  })
  startSec?: number;

  @Column({
    type: DataType.DECIMAL(10, 3),
    allowNull: true
  })
  endSec?: number;

  @Column({
    type: DataType.TEXT('long'),
    allowNull: false
  })
  content!: string;

  @Column({
    type: 'VECTOR(768)',
    allowNull: true
  })
  embedding?: number[];

  @BelongsTo(() => Video)
  video!: Video;

  @BelongsTo(() => Transcript)
  transcript!: Transcript;
}
