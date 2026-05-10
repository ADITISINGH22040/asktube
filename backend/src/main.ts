import 'dotenv/config';

import {ValidationPipe} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {NestFactory} from '@nestjs/core';
import {NestExpressApplication} from '@nestjs/platform-express';
import {HttpConfig} from './config/app.conf';
import {AppModule} from './modules/app/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  app.disable('etag');
  app.disable('x-powered-by');
  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const httpConfig = configService.getOrThrow<HttpConfig>('http');

  await app.listen(httpConfig.port, () => {
    console.log(`Application listening on port ${httpConfig.port}`);
  });
}

bootstrap();
