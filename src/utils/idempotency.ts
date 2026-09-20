import Redis from "ioredis";
import { env } from "../config/env";

const redis = new Redis({
  host: env.redisHost,
  port: env.redisPort,
});

export async function acquireIdempotencyLock(
  eventId: string,
  channel: string,
  userId: string
): Promise<boolean> {
  const key = `idem:${eventId}:${channel}:${userId}`;
  const result = await redis.set(key, "1", "EX", 60 * 60 * 24, "NX");
  return result === "OK";
}
