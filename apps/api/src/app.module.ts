import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { TenantModule } from './tenant/tenant.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
    }),
    ConfigModule.forFeature(appConfig),
    ConfigModule.forFeature(authConfig),
    TenantModule,
    AuthModule,
    HealthModule,
  ],
})
export class AppModule {}
