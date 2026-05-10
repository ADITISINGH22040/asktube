import {Table, Column, Model, DataType, BelongsTo, ForeignKey} from 'sequelize-typescript';
import {Video} from './video.model';

@Table({
  tableName: 'transcripts'
})
export class Transcript extends Model {
  @ForeignKey(() => Video)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true
  })
  videoId!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  language!: string;

  @Column({
    type: DataType.TEXT('long'),
    allowNull: false
  })
  rawText!: string;

  @BelongsTo(() => Video)
  video!: Video;
}
