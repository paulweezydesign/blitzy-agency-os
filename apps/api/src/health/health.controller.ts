import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  index() {
    return {
      status: 'ok',
      uptime: process.uptime(),
    } as const;
  }
}
