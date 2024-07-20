import { ConfigService } from '@nestjs/config';
import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as AWS from 'aws-sdk';

export let app: INestApplication;

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<string >('SERVER_PORT');

  // 네이버 클라우드 오브젝트 스토리지 설정
  const naverConfig = {
    accessKeyId: configService.get<string>('NAVER_ACCESS_KEY_ID'),
    secretAccessKey: configService.get<string>('NAVER_SECRET_ACCESS_KEY'),
    region: configService.get<string>('NAVER_REGION'),
    endpoint: configService.get<string>('NAVER_ENDPOINT'),
  };
  const s3 = new AWS.S3(naverConfig);

  app.use(cookieParser());
  app.enableCors({ origin: true, credentials: true });
  app.listen(process.env.PORT || port || 3000, () => {
    logger.log(`Application running on port ${port}`);
  });
}
bootstrap();
