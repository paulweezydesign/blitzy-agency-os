import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TenantModule } from '../tenant/tenant.module';
import { AuditInterceptor } from './audit.interceptor';
import { RequestTracingInterceptor } from './request-tracing.interceptor';
import { TracingService } from './tracing.service';

@Module({
  imports: [TenantModule],
  providers: [
    TracingService,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestTracingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
  exports: [TracingService],
})
export class ObservabilityModule {}
