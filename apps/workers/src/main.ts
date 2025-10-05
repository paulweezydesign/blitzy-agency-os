import { config } from './config';
import { logger } from './logger';
import { BaseWorker, BaseJobData } from './queues/base-worker';

interface ExampleJob extends BaseJobData {
  payload: Record<string, unknown>;
}

async function bootstrap() {
  logger.info({ env: config.NODE_ENV }, 'Starting worker runtime');

  new BaseWorker<ExampleJob>('agencyos:integration:webhooks', async (job, context) => {
    const store = context.get();
    logger.info({ jobId: job.id, tenantId: store.tenantId, data: job.data.payload }, 'Handled webhook job');
  });
}

bootstrap().catch((error) => {
  logger.error({ error }, 'Failed to bootstrap worker');
  process.exit(1);
});
