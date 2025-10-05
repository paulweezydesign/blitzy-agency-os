import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { TenantContextService } from './tenant-context.service';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(private readonly contextService: TenantContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const tenantId = this.extractTenantId(request);

    return this.contextService.run(
      {
        tenantId,
        requestId: request.id ? String(request.id) : undefined,
      },
      () => next.handle(),
    );
  }

  private extractTenantId(request: FastifyRequest): string | undefined {
    const header = request.headers['x-tenant-id'] ?? request.headers['tenant'];

    if (Array.isArray(header)) {
      return header[0];
    }

    return header?.toString();
  }
}
