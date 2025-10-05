import { CanActivate, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { AuthService, AuthenticatedPrincipal } from './auth.service';
import { TenantContextService } from '../tenant/tenant-context.service';
export interface AuthenticatedRequest extends FastifyRequest {
    user?: AuthenticatedPrincipal;
}
export declare class JwtAuthGuard implements CanActivate {
    private readonly authService;
    private readonly tenantContext;
    constructor(authService: AuthService, tenantContext: TenantContextService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractToken;
    private resolveTenantId;
}
