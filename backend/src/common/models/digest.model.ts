import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Video } from './video.model';

@Table({
  tableName: 'digests',
})
export class Digest extends Model {

  @ForeignKey(() => Video)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    unique: true,
  })
  videoId!: number;

  @Column({
    type: DataType.TEXT('long'),
    allowNull: false,
  })
  contentMarkdown!: string;



  @BelongsTo(() => Video)
  video!: Video;
}
