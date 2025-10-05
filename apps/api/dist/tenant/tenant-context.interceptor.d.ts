import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContextService } from './tenant-context.service';
export declare class TenantContextInterceptor implements NestInterceptor {
    private readonly contextService;
    constructor(contextService: TenantContextService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
    private extractTenantId;
}
