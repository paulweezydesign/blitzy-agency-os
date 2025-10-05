import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { FastifyRequest, FastifyReply } from 'fastify';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { TenantContextService } from '../tenant/tenant-context.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly tenantContext: TenantContextService,
    @InjectPinoLogger(AuditInterceptor.name) private readonly logger: PinoLogger,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<FastifyRequest>();
    const response = httpContext.getResponse<FastifyReply>();
    const startedAt = Date.now();

    return next.handle().pipe(
      finalize(() => {
        const durationMs = Date.now() - startedAt;
        const tenantContext = this.tenantContext.get();

        this.logger.info({
          event: 'http_request',
          method: request.method,
          path: request.url,
          requestId: tenantContext.requestId,
          userId: tenantContext.userId,
          tenantId: tenantContext.tenantId,
          roles: tenantContext.roles,
          statusCode: response.statusCode,
          durationMs,
        });
      }),
    );
  }
}
