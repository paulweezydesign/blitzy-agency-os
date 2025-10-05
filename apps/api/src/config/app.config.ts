import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const schema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
  })
  .transform((value) => ({
    environment: value.NODE_ENV,
    port: value.PORT,
  }));

export type AppConfig = z.infer<typeof schema>;

export default registerAs('app', () => {
  const parsed = schema.parse({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
  });

  return parsed satisfies AppConfig;
});
