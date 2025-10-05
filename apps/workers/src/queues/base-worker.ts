import { Worker, WorkerOptions, QueueEvents, Job } from 'bullmq';
import IORedis from 'ioredis';
import { TenantContextStore } from '@agencyos/context';
import { logger } from '../logger';
import { config } from '../config';

export interface BaseJobData {
  tenantId?: string;
  actorId?: string;
  requestId?: string;
  [key: string]: unknown;
}

export type JobHandler<TData extends BaseJobData> = (
  job: Job<TData>,
  context: TenantContextStore,
) => Promise<void>;

export class BaseWorker<TData extends BaseJobData> {
  protected readonly tenantContext = new TenantContextStore();
  private readonly redisConnection = new IORedis(config.REDIS_URL);
  private readonly worker: Worker<TData, void>;
  private readonly queueEvents: QueueEvents;

  constructor(queueName: string, handler: JobHandler<TData>, options?: WorkerOptions) {
    this.worker = new Worker<TData, void>(
      queueName,
      async (job) => {
        const { tenantId, actorId, requestId, ...rest } = (job.data ?? {}) as BaseJobData;

        return this.tenantContext.run(
          {
            tenantId,
            userId: actorId,
            requestId: requestId ?? job.id,
          },
          async () => {
            logger.debug({ queueName, jobId: job.id, tenantId, data: rest }, 'Processing job');
            await handler(job as Job<TData>, this.tenantContext);
          },
        );
      },
      {
        concurrency: options?.concurrency ?? 5,
        connection: this.redisConnection,
        autorun: options?.autorun ?? true,
      },
    );

    this.queueEvents = new QueueEvents(queueName, {
      connection: this.redisConnection,
    });

    this.queueEvents.on('failed', ({ jobId, failedReason }) => {
      logger.error({ queueName, jobId, failedReason }, 'Job failed');
    });

    this.queueEvents.on('completed', ({ jobId }) => {
      logger.debug({ queueName, jobId }, 'Job completed');
    });

    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }

  private async shutdown() {
    logger.info('Shutting down worker');
    await Promise.all([this.worker.close(), this.queueEvents.close(), this.redisConnection.quit()]);
    process.exit(0);
  }
}
