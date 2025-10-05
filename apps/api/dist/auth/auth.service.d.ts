import { ConfigService } from '@nestjs/config';
import { JWTPayload } from 'jose';
export interface AuthenticatedPrincipal extends JWTPayload {
    sub?: string;
    tenant_id?: string;
    permissions?: string[];
}
export declare class AuthService {
    private readonly configService;
    private remoteJwks?;
    private remoteJwksUrl?;
    constructor(configService: ConfigService);
    verify(token?: string): Promise<AuthenticatedPrincipal>;
    private getRemoteJwks;
}
