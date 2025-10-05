import { z } from 'zod';
declare const schema: z.ZodPipe<z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        development: "development";
        test: "test";
        production: "production";
    }>>;
    PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>, z.ZodTransform<{
    environment: "development" | "test" | "production";
    port: number;
}, {
    NODE_ENV: "development" | "test" | "production";
    PORT: number;
}>>;
export type AppConfig = z.infer<typeof schema>;
declare const _default: (() => {
    environment: "development" | "test" | "production";
    port: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    environment: "development" | "test" | "production";
    port: number;
}>;
export default _default;
