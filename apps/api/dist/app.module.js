"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_pino_1 = require("nestjs-pino");
const app_config_1 = __importDefault(require("./config/app.config"));
const auth_config_1 = __importDefault(require("./config/auth.config"));
const auth_module_1 = require("./auth/auth.module");
const health_module_1 = require("./health/health.module");
const observability_module_1 = require("./observability/observability.module");
const prisma_module_1 = require("./prisma/prisma.module");
const rbac_module_1 = require("./rbac/rbac.module");
const tenant_module_1 = require("./tenant/tenant.module");
const workspaces_module_1 = require("./workspaces/workspaces.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_pino_1.LoggerModule.forRoot({
                pinoHttp: {
                    level: process.env.LOG_LEVEL ?? 'info',
                    transport: process.env.NODE_ENV === 'production'
                        ? undefined
                        : {
                            target: 'pino-pretty',
                            options: {
                                singleLine: true,
                                colorize: true,
                            },
                        },
                    customProps: (req) => ({ requestId: req.id }),
                },
            }),
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                cache: true,
                expandVariables: true,
            }),
            config_1.ConfigModule.forFeature(app_config_1.default),
            config_1.ConfigModule.forFeature(auth_config_1.default),
            tenant_module_1.TenantModule,
            auth_module_1.AuthModule,
            prisma_module_1.PrismaModule,
            rbac_module_1.RbacModule,
            health_module_1.HealthModule,
            workspaces_module_1.WorkspacesModule,
            observability_module_1.ObservabilityModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map