import { Queue } from "bullmq";
import { env } from "../config/env";
import { RETRY_CONFIG } from "../config/retry";

export interface DispatchPushJob {
  eventId: string;
  userId: string;
  channel: "push";
}

export const dispatchPushQueue = new Queue<DispatchPushJob>(
  "dispatch-push",
  {
    connection: {
      host: env.redisHost,
      port: env.redisPort,
    },
    defaultJobOptions: {
      attempts: RETRY_CONFIG.attempts,
      backoff: RETRY_CONFIG.backoff,
      removeOnComplete: RETRY_CONFIG.removeOnComplete,
      removeOnFail: RETRY_CONFIG.removeOnFail,
    },
  }
);