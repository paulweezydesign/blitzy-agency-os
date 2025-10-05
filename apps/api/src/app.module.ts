import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { ObservabilityModule } from './observability/observability.module';
import { PrismaModule } from './prisma/prisma.module';
import { RbacModule } from './rbac/rbac.module';
import { TenantModule } from './tenant/tenant.module';
import { WorkspacesModule } from './workspaces/workspaces.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        transport:
          process.env.NODE_ENV === 'production'
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
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
    }),
    ConfigModule.forFeature(appConfig),
    ConfigModule.forFeature(authConfig),
    TenantModule,
    AuthModule,
    PrismaModule,
    RbacModule,
    HealthModule,
    WorkspacesModule,
    ObservabilityModule,
  ],
})
export class AppModule {}
