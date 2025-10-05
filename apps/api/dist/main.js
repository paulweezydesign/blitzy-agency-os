"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const helmet_1 = __importDefault(require("@fastify/helmet"));
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter({
        logger: false,
    }), {
        bufferLogs: true,
    });
    const fastifyInstance = app.getHttpAdapter().getInstance();
    await fastifyInstance.register(helmet_1.default, { contentSecurityPolicy: false });
    const config = app.get(config_1.ConfigService);
    const port = config.getOrThrow('app.port');
    const logger = new common_1.Logger('Bootstrap');
    await app.listen({ port, host: '0.0.0.0' });
    logger.log(`API listening on http://0.0.0.0:${port}`);
}
bootstrap().catch((err) => {
    console.error('Failed to start application:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map