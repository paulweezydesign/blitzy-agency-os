"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jose_1 = require("jose");
let AuthService = class AuthService {
    configService;
    remoteJwks;
    remoteJwksUrl;
    constructor(configService) {
        this.configService = configService;
    }
    async verify(token) {
        const config = this.configService.get('auth');
        if (!config?.enabled) {
            return { sub: 'anonymous' };
        }
        if (!token) {
            throw new common_1.UnauthorizedException('Missing bearer token');
        }
        const verificationOptions = {
            audience: config.audience,
            issuer: config.issuer,
        };
        try {
            if (config.secret) {
                const secret = new TextEncoder().encode(config.secret);
                const { payload } = await (0, jose_1.jwtVerify)(token, secret, verificationOptions);
                return payload;
            }
            const jwks = this.getRemoteJwks(config);
            if (!jwks) {
                throw new common_1.UnauthorizedException('JWKS configuration missing');
            }
            const { payload } = await (0, jose_1.jwtVerify)(token, jwks, verificationOptions);
            return payload;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Unable to verify token');
        }
    }
    getRemoteJwks(config) {
        if (!config.jwksUrl) {
            return undefined;
        }
        if (this.remoteJwks && this.remoteJwksUrl === config.jwksUrl) {
            return this.remoteJwks;
        }
        const jwks = (0, jose_1.createRemoteJWKSet)(new URL(config.jwksUrl), {
            cacheMaxAge: config.jwksCacheTtlMs,
        });
        this.remoteJwks = jwks;
        this.remoteJwksUrl = config.jwksUrl;
        return jwks;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map