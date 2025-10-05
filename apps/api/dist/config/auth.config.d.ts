import { z } from 'zod';
declare const schema: z.ZodPipe<z.ZodObject<{
    AUTH_ENABLED: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<boolean | undefined, string | undefined>>;
    AUTH_AUDIENCE: z.ZodOptional<z.ZodString>;
    AUTH_ISSUER: z.ZodOptional<z.ZodString>;
    AUTH_SECRET: z.ZodOptional<z.ZodString>;
}, z.core.$strip>, z.ZodTransform<{
    enabled: boolean;
    audience: string | undefined;
    issuer: string | undefined;
    secret: string | undefined;
}, {
    AUTH_ENABLED: boolean | undefined;
    AUTH_AUDIENCE?: string | undefined;
    AUTH_ISSUER?: string | undefined;
    AUTH_SECRET?: string | undefined;
}>>;
export type AuthConfig = z.infer<typeof schema>;
declare const _default: (() => {
    enabled: boolean;
    audience: string | undefined;
    issuer: string | undefined;
    secret: string | undefined;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    enabled: boolean;
    audience: string | undefined;
    issuer: string | undefined;
    secret: string | undefined;
}>;
export default _default;
