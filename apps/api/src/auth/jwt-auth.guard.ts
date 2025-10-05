import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { AuthService, AuthenticatedPrincipal } from './auth.service';
import { TenantContextService } from '../tenant/tenant-context.service';

interface RequestWithUser extends FastifyRequest {
  user?: AuthenticatedPrincipal;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly tenantContext: TenantContextService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractToken(request);

    const principal = this.authService.verify(token);
    request.user = principal;

    if (principal.tenant_id) {
      this.tenantContext.setTenant(principal.tenant_id);
    }

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
}
