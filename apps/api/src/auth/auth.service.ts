import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';
import { AuthConfig } from '../config/auth.config';

export interface AuthenticatedPrincipal extends JWTPayload {
  sub?: string;
  tenant_id?: string;
  permissions?: string[];
}

@Injectable()
export class AuthService {
  private remoteJwks?: ReturnType<typeof createRemoteJWKSet>;
  private remoteJwksUrl?: string;

  constructor(private readonly configService: ConfigService) {}

  async verify(token?: string): Promise<AuthenticatedPrincipal> {
    const config = this.configService.get<AuthConfig>('auth');

    if (!config?.enabled) {
      return { sub: 'anonymous' };
    }

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const verificationOptions = {
      audience: config.audience,
      issuer: config.issuer,
    } as const;

    try {
      if (config.secret) {
        const secret = new TextEncoder().encode(config.secret);
        const { payload } = await jwtVerify(token, secret, verificationOptions);
        return payload as AuthenticatedPrincipal;
      }

      const jwks = this.getRemoteJwks(config);
      if (!jwks) {
        throw new UnauthorizedException('JWKS configuration missing');
      }

      const { payload } = await jwtVerify(token, jwks, verificationOptions);
      return payload as AuthenticatedPrincipal;
    } catch (error) {
      throw new UnauthorizedException('Unable to verify token');
    }
  }

  private getRemoteJwks(config: AuthConfig) {
    if (!config.jwksUrl) {
      return undefined;
    }

    if (this.remoteJwks && this.remoteJwksUrl === config.jwksUrl) {
      return this.remoteJwks;
    }

    const jwks = createRemoteJWKSet(new URL(config.jwksUrl), {
      cacheMaxAge: config.jwksCacheTtlMs,
    });
    this.remoteJwks = jwks;
    this.remoteJwksUrl = config.jwksUrl;
    return jwks;
  }
}
