"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
const zod_1 = require("zod");
const schema = zod_1.z
    .object({
    AUTH_ENABLED: zod_1.z
        .string()
        .optional()
        .transform((value) => (value === undefined ? undefined : value === 'true')),
    AUTH_AUDIENCE: zod_1.z.string().min(1).optional(),
    AUTH_ISSUER: zod_1.z.string().url().optional(),
    AUTH_JWKS_URL: zod_1.z.string().url().optional(),
    AUTH_JWKS_CACHE_TTL_MS: zod_1.z.coerce.number().int().positive().optional(),
    AUTH_SECRET: zod_1.z.string().min(10).optional(),
})
    .transform((value) => {
    const enabled = value.AUTH_ENABLED ?? Boolean(value.AUTH_SECRET || value.AUTH_ISSUER);
    const issuer = value.AUTH_ISSUER;
    const jwksUrl = value.AUTH_JWKS_URL ?? (issuer ? `${issuer.replace(/\/$/, '')}/.well-known/jwks.json` : undefined);
    if (enabled) {
        if (!value.AUTH_SECRET && !issuer) {
            throw new Error('AUTH_SECRET or AUTH_ISSUER must be configured when authentication is enabled');
        }
        if (!value.AUTH_AUDIENCE) {
            throw new Error('AUTH_AUDIENCE is required when authentication is enabled');
        }
    }
    return {
        enabled,
        audience: value.AUTH_AUDIENCE,
        issuer,
        jwksUrl,
        jwksCacheTtlMs: value.AUTH_JWKS_CACHE_TTL_MS ?? 600_000,
        secret: value.AUTH_SECRET,
    };
});
exports.default = (0, config_1.registerAs)('auth', () => {
    const parsed = schema.parse({
        AUTH_ENABLED: process.env.AUTH_ENABLED,
        AUTH_AUDIENCE: process.env.AUTH_AUDIENCE,
        AUTH_ISSUER: process.env.AUTH_ISSUER,
        AUTH_JWKS_URL: process.env.AUTH_JWKS_URL,
        AUTH_JWKS_CACHE_TTL_MS: process.env.AUTH_JWKS_CACHE_TTL_MS,
        AUTH_SECRET: process.env.AUTH_SECRET,
    });
    return parsed;
});
//# sourceMappingURL=auth.config.js.map