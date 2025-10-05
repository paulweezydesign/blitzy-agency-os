import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false,
    }),
    {
      bufferLogs: true,
    },
  );

  await app.register(helmet, { contentSecurityPolicy: false });

  const config = app.get(ConfigService);
  const port = config.getOrThrow<number>('app.port');
  const logger = new Logger('Bootstrap');

  await app.listen({ port, host: '0.0.0.0' });
  logger.log(`API listening on http://0.0.0.0:${port}`);
}

bootstrap();
