"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const helmet_1 = __importDefault(require("@fastify/helmet"));
const nestjs_pino_1 = require("nestjs-pino");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter({
        logger: false,
    }), {
        bufferLogs: true,
    });
    await app.register(helmet_1.default, { contentSecurityPolicy: false });
    const config = app.get(config_1.ConfigService);
    const port = config.getOrThrow('app.port');
    const logger = app.get(nestjs_pino_1.Logger);
    app.useLogger(logger);
    await app.listen({ port, host: '0.0.0.0' });
    logger.log(`API listening on http://0.0.0.0:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map