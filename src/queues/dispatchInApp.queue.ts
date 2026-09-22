import { Queue } from "bullmq";
import { env } from "../config/env";
import { RETRY_CONFIG } from "../config/retry";

export interface DispatchInAppJob {
  eventId: string;
  userId: string;
  channel: "in_app";
}

export const dispatchInAppQueue = new Queue<DispatchInAppJob>(
  "dispatch-in-app",
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