import { z } from 'zod';
declare const schema: z.ZodPipe<z.ZodObject<{
    AUTH_ENABLED: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<boolean | undefined, string | undefined>>;
    AUTH_AUDIENCE: z.ZodOptional<z.ZodString>;
    AUTH_ISSUER: z.ZodOptional<z.ZodString>;
    AUTH_JWKS_URL: z.ZodOptional<z.ZodString>;
    AUTH_JWKS_CACHE_TTL_MS: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    AUTH_SECRET: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodTransform<{
    readonly enabled: boolean;
    readonly audience: string | undefined;
    readonly issuer: string | undefined;
    readonly jwksUrl: string | undefined;
    readonly jwksCacheTtlMs: number;
    readonly secret: string | undefined;
}, {
    AUTH_ENABLED: boolean | undefined;
    AUTH_AUDIENCE?: string | undefined;
    AUTH_ISSUER?: string | undefined;
    AUTH_JWKS_URL?: string | undefined;
    AUTH_JWKS_CACHE_TTL_MS?: number | undefined;
    AUTH_SECRET?: string | undefined;
}>>;
export type AuthConfig = z.infer<typeof schema>;
declare const _default: (() => {
    readonly enabled: boolean;
    readonly audience: string | undefined;
    readonly issuer: string | undefined;
    readonly jwksUrl: string | undefined;
    readonly jwksCacheTtlMs: number;
    readonly secret: string | undefined;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    readonly enabled: boolean;
    readonly audience: string | undefined;
    readonly issuer: string | undefined;
    readonly jwksUrl: string | undefined;
    readonly jwksCacheTtlMs: number;
    readonly secret: string | undefined;
}>;
export default _default;
