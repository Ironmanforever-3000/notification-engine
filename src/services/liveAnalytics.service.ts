import Redis from "ioredis";
import { env } from "../config/env";

const redis = new Redis({
  host: env.redisHost,
  port: env.redisPort,
});

/**
 * Increment a per-channel live counter in Redis.
 * Each key lives for 120 seconds (covers current + previous minute bucket).
 *
 * Key format: analytics:live:{channel}:{minuteBucket}
 */
export async function incrementLiveCounter(channel: string): Promise<number> {
  const minuteBucket = Math.floor(Date.now() / 60000);
  const key = `analytics:live:${channel}:${minuteBucket}`;
  const count = await redis.incr(key);
  await redis.expire(key, 120);
  return count;
}

/**
 * Read live counters for all 5 channels.
 * Returns the sum of current + previous minute bucket for each channel
 * to provide a "last ~60 seconds" view.
 */
export async function getLiveCounters(): Promise<Record<string, number>> {
  const channels = ["sms", "email", "push", "whatsapp", "in_app"];
  const now = Math.floor(Date.now() / 60000);
  const prev = now - 1;

  const result: Record<string, number> = {};

  for (const channel of channels) {
    const [currentStr, prevStr] = await Promise.all([
      redis.get(`analytics:live:${channel}:${now}`),
      redis.get(`analytics:live:${channel}:${prev}`),
    ]);
    result[channel] = (parseInt(currentStr ?? "0", 10)) + (parseInt(prevStr ?? "0", 10));
  }

  return result;
}
