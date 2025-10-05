import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import { Logger } from 'nestjs-pino';
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
  const logger = app.get(Logger);
  app.useLogger(logger);

  await app.listen({ port, host: '0.0.0.0' });
  logger.log(`API listening on http://0.0.0.0:${port}`);
}

bootstrap();
