import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TenantContextService } from '../tenant/tenant-context.service';
export declare class JwtAuthGuard implements CanActivate {
    private readonly authService;
    private readonly tenantContext;
    constructor(authService: AuthService, tenantContext: TenantContextService);
    canActivate(context: ExecutionContext): boolean;
    private extractToken;
}
