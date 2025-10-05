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
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const tenant_context_service_1 = require("../tenant/tenant-context.service");
let JwtAuthGuard = class JwtAuthGuard {
    authService;
    tenantContext;
    constructor(authService, tenantContext) {
        this.authService = authService;
        this.tenantContext = tenantContext;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
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
    extractToken(request) {
        const headerValue = request.headers['authorization'];
        if (!headerValue) {
            return undefined;
        }
        const value = Array.isArray(headerValue) ? headerValue[0] : headerValue;
        const [scheme, token] = value.split(' ');
        if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
            throw new common_1.UnauthorizedException('Invalid Authorization header');
        }
        return token;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        tenant_context_service_1.TenantContextService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map