import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/sequelize';
import {Optional, Transaction} from 'sequelize';
import {Sequelize} from 'sequelize-typescript';
import {withTransaction} from '../../common/db/transaction-helper';
import {Video, VideoStatus} from '../../common/models/video.model';

@Injectable()
export class VideosRepository {
  private readonly videoAttributes: string[] = [
    'id',
    'youtubeId',
    'url',
    'title',
    'channelName',
    'thumbnailUrl',
    'status',
    'createdAt',
    'updatedAt'
  ];

  constructor(
    @InjectModel(Video)
    private readonly videoModel: typeof Video,
    private readonly sequelize: Sequelize
  ) {}

  async findByYoutubeId(youtubeId: string): Promise<Video | null> {
    return this.videoModel.findOne({
      where: {youtubeId},
      attributes: this.videoAttributes
    });
  }

  async findVideoById(videoId: number): Promise<Video | null> {
    return this.videoModel.findOne({
      where: {id: videoId},
      attributes: this.videoAttributes
    });
  }

  async createVideo(values: Optional<Video, any>): Promise<Video> {
    return this.videoModel.create(values, {raw: true});
  }

  async updateVideoStatus(
    id: number,
    status: VideoStatus,
    transaction?: Transaction
  ): Promise<Video | null> {
    const update = async (tx: Transaction) => {
      const video = await this.videoModel.findOne({
        where: {id},
        transaction: tx
      });

      if (!video) {
        return null;
      }

      return video.update({status}, {transaction: tx, returning: true});
    };

    if (transaction) {
      return update(transaction);
    }

    return withTransaction<Video | null>(this.sequelize, update);
  }
}
