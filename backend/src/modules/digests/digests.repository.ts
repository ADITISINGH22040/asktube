import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/sequelize';
import {Sequelize} from 'sequelize-typescript';
import {withTransaction} from '../../common/db/transaction-helper';
import {Digest} from '../../common/models/digest.model';

@Injectable()
export class DigestsRepository {
  constructor(
    @InjectModel(Digest)
    private readonly digestModel: typeof Digest,
    private readonly sequelize: Sequelize
  ) {}

  async findDigestByVideoId(videoId: number): Promise<Digest | null> {
    return this.digestModel.findOne({
      where: {videoId}
    });
  }

  async upsertDigest(videoId: number, contentMarkdown: string): Promise<Digest> {
    return withTransaction<Digest>(this.sequelize, async (transaction) => {
      const existingDigest = await this.digestModel.findOne({
        where: {videoId},
        transaction
      });

      if (existingDigest) {
        await existingDigest.update({contentMarkdown}, {transaction});
        await existingDigest.reload();
        return existingDigest;
      }

      return this.digestModel.create(
        {
          videoId,
          contentMarkdown
        },
        {transaction}
      );
    });
  }
}
