import { z } from 'zod';
import * as dotenv from 'dotenv';

/**
 * Zod schema for validating environment variables.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

/** Inferred type for validated environment variables. */
export type Environment = z.infer<typeof envSchema>;

/**
 * Loads environment variables from `.env`, then parses and
 * validates them against the schema.
 *
 * @returns The validated environment object.
 * @throws If any required variable is missing or invalid.
 */
export function loadEnvironment(): Environment {
  dotenv.config();

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.format());
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

