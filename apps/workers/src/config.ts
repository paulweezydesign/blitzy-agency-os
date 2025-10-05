import dotenvFlow from 'dotenv-flow';
import { z } from 'zod';

dotenvFlow.config();

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  REDIS_URL: z.string().url(),
  LOG_LEVEL: z.string().default('info'),
});

const parsed = schema.parse(process.env);

export type WorkerConfig = typeof parsed;

export const config: WorkerConfig = parsed;
