"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const zod_1 = require("zod");
const schema = zod_1.z
    .object({
    AUTH_ENABLED: zod_1.z
        .string()
        .optional()
        .transform((value) => value === undefined ? undefined : value === 'true'),
    AUTH_AUDIENCE: zod_1.z.string().min(1).optional(),
    AUTH_ISSUER: zod_1.z.string().url().optional(),
    AUTH_SECRET: zod_1.z.string().min(10).optional(),
})
    .transform((value) => ({
    enabled: value.AUTH_ENABLED ?? Boolean(value.AUTH_SECRET),
    audience: value.AUTH_AUDIENCE,
    issuer: value.AUTH_ISSUER,
    secret: value.AUTH_SECRET,
}));
exports.default = (0, config_1.registerAs)('auth', () => {
    const parsed = schema.parse({
        AUTH_ENABLED: process.env.AUTH_ENABLED,
        AUTH_AUDIENCE: process.env.AUTH_AUDIENCE,
        AUTH_ISSUER: process.env.AUTH_ISSUER,
        AUTH_SECRET: process.env.AUTH_SECRET,
    });
    return parsed;
});
//# sourceMappingURL=auth.config.js.map