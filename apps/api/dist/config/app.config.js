"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const zod_1 = require("zod");
const schema = zod_1.z
    .object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.coerce.number().int().positive().default(3000),
})
    .transform((value) => ({
    environment: value.NODE_ENV,
    port: value.PORT,
}));
exports.default = (0, config_1.registerAs)('app', () => {
    const parsed = schema.parse({
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
    });
    return parsed;
});
//# sourceMappingURL=app.config.js.map