import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'jsonwebtoken';
export interface AuthenticatedPrincipal extends JwtPayload {
    sub?: string;
    tenant_id?: string;
    permissions?: string[];
}
export declare class AuthService {
    private readonly configService;
    constructor(configService: ConfigService);
    verify(token?: string): AuthenticatedPrincipal;
}
