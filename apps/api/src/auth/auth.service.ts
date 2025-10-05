import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AuthConfig } from '../config/auth.config';

export interface AuthenticatedPrincipal extends JwtPayload {
  sub?: string;
  tenant_id?: string;
  permissions?: string[];
}

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService) {}

  verify(token?: string): AuthenticatedPrincipal {
    const config = this.configService.get<AuthConfig>('auth');

    if (!config?.enabled) {
      return { sub: 'anonymous' };
    }

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    if (!config.secret) {
      throw new UnauthorizedException('AUTH_SECRET is required when auth is enabled');
    }

    try {
      return jwt.verify(token, config.secret, {
        audience: config.audience,
        issuer: config.issuer,
      }) as AuthenticatedPrincipal;
    } catch (error) {
      throw new UnauthorizedException('Unable to verify token');
    }
  }
}
