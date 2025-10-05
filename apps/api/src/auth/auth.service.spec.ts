import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthConfig } from '../config/auth.config';

const jwtVerifyMock = jest.fn();
const createRemoteJwksMock = jest.fn(() => jest.fn());

jest.mock('jose', () => ({
  jwtVerify: (...args: unknown[]) => jwtVerifyMock(...args),
  createRemoteJWKSet: (...args: unknown[]) => createRemoteJwksMock(...args),
}));

describe('AuthService', () => {
  beforeEach(() => {
    jwtVerifyMock.mockReset();
    createRemoteJwksMock.mockClear();
  });

  it('returns anonymous principal when auth disabled', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue({ enabled: false } satisfies Partial<AuthConfig>),
          },
        },
      ],
    }).compile();

    const service = moduleRef.get(AuthService);
    await expect(service.verify()).resolves.toEqual({ sub: 'anonymous' });
    expect(jwtVerifyMock).not.toHaveBeenCalled();
  });

  it('verifies tokens with local secret when configured', async () => {
    const config: AuthConfig = {
      enabled: true,
      audience: 'https://api.example.com',
      issuer: 'https://issuer.example.com/',
      jwksUrl: undefined,
      jwksCacheTtlMs: 600_000,
      secret: 'supersecretvalue',
    };

    jwtVerifyMock.mockResolvedValue({ payload: { sub: 'user_123', tenant_id: 'tenant_456' } });

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(config),
          },
        },
      ],
    }).compile();

    const service = moduleRef.get(AuthService);

    await expect(service.verify('token')).resolves.toMatchObject({
      sub: 'user_123',
      tenant_id: 'tenant_456',
    });

    expect(createRemoteJwksMock).not.toHaveBeenCalled();
    expect(jwtVerifyMock).toHaveBeenCalledWith(
      'token',
      expect.any(Uint8Array),
      expect.objectContaining({
        audience: 'https://api.example.com',
        issuer: 'https://issuer.example.com/',
      }),
    );
  });

  it('throws when token missing and auth enabled', async () => {
    const config: AuthConfig = {
      enabled: true,
      audience: 'aud',
      issuer: 'https://issuer.example.com/',
      jwksUrl: undefined,
      jwksCacheTtlMs: 600_000,
      secret: 'anothersecret',
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(config),
          },
        },
      ],
    }).compile();

    const service = moduleRef.get(AuthService);
    await expect(service.verify()).rejects.toThrow(UnauthorizedException);
  });
});
