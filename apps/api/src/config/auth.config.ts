import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const schema = z
  .object({
    AUTH_ENABLED: z
      .string()
      .optional()
      .transform((value) => (value === undefined ? undefined : value === 'true')),
    AUTH_AUDIENCE: z.string().min(1).optional(),
    AUTH_ISSUER: z.string().url().optional(),
    AUTH_SECRET: z.string().min(10).optional(),
  })
  .transform((value) => ({
    enabled: value.AUTH_ENABLED ?? Boolean(value.AUTH_SECRET),
    audience: value.AUTH_AUDIENCE,
    issuer: value.AUTH_ISSUER,
    secret: value.AUTH_SECRET,
  }));

export type AuthConfig = z.infer<typeof schema>;

export default registerAs('auth', () => {
  const parsed = schema.parse({
    AUTH_ENABLED: process.env.AUTH_ENABLED,
    AUTH_AUDIENCE: process.env.AUTH_AUDIENCE,
    AUTH_ISSUER: process.env.AUTH_ISSUER,
    AUTH_SECRET: process.env.AUTH_SECRET,
  });

  return parsed satisfies AuthConfig;
});
