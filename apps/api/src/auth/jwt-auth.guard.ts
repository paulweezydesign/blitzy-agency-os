import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { AuthService, AuthenticatedPrincipal } from './auth.service';
import { TenantContextService } from '../tenant/tenant-context.service';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: AuthenticatedPrincipal;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);

    const principal = await this.authService.verify(token);
    request.user = principal;

    const tenantId = this.resolveTenantId(principal);
    this.tenantContext.setTenant(tenantId);

    this.tenantContext.merge({
      userId: principal.sub,
      roles: Array.isArray(principal.permissions)
        ? principal.permissions.map((value) => value.toString())
        : undefined,
    });

    return true;
  }

  private extractToken(request: FastifyRequest): string | undefined {
    const headerValue = request.headers['authorization'];

    if (!headerValue) {
      return undefined;
    }

    const value = Array.isArray(headerValue) ? headerValue[0] : headerValue;
    const [scheme, token] = value.split(' ');

    if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException('Invalid Authorization header');
    }

    return token;
  }

  private resolveTenantId(principal: AuthenticatedPrincipal): string | undefined {
    const tenantClaim = principal.tenant_id;
    if (tenantClaim) {
      return tenantClaim;
    }

    const customClaim = principal['https://agencyos.ai/tenant'];
    if (typeof customClaim === 'string') {
      return customClaim;
    }

    return undefined;
  }
}
