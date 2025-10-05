import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { TenantContextService } from '../tenant/tenant-context.service';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly databaseUrl?: string;

  constructor(
    configService: ConfigService,
    private readonly tenantContext: TenantContextService,
  ) {
    const databaseUrl = configService.get<string>('DATABASE_URL');

    super({
      datasources: databaseUrl
        ? {
            db: {
              url: databaseUrl,
            },
          }
        : undefined,
      log: ['warn', 'error'],
    });

    this.databaseUrl = databaseUrl;

    this.$extends({
      query: {
        $allModels: {
          $allOperations: async ({ args, query }) => {
            // Placeholder hook: future iteration will push tenant metadata into the
            // PostgreSQL session (SET LOCAL) to satisfy RLS policies. Keeping the
            // tenant context read here ensures the AsyncLocalStorage chain is
            // captured for later enhancement without altering query behaviour.
            void this.tenantContext.get();

            return query(args);
          },
        },
      },
    });
  }

  async onModuleInit(): Promise<void> {
    const url = this.databaseUrl ?? process.env.DATABASE_URL;

    if (!url) {
      this.logger.warn(
        'DATABASE_URL is not configured. Prisma will remain disconnected until it is provided.',
      );
      return;
    }

    await this.$connect();
    this.logger.log('Connected to PostgreSQL via Prisma');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  getCurrentTenantId(): string | undefined {
    return this.tenantContext.get().tenantId;
  }
}
