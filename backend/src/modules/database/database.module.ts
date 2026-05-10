import {Module} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {SequelizeModule, SequelizeModuleOptions} from '@nestjs/sequelize';
import {Sequelize} from 'sequelize-typescript';
import * as models from '../../common/models';
import {DatabaseConfig} from '../../config/app.conf';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: (configService: ConfigService): SequelizeModuleOptions => {
        const dbConfig = configService.getOrThrow<DatabaseConfig>('database');
        const modelsArray = Object.values(models);

        return {
          uri: dbConfig.url,
          dialect: 'postgres',
          autoLoadModels: true,
          synchronize: false,
          models: modelsArray,
          pool: {
            max: dbConfig.poolSize,
            min: 0,
            acquire: 30000,
            idle: 10000
          },
          logging: process.env.NODE_ENV === 'development' ? console.log : false
        };
      },
      inject: [ConfigService]
    })
  ]
})
export class DatabaseModule {
  constructor(private readonly sequelize: Sequelize) {}
}
