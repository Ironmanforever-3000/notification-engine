import { Queue } from "bullmq";
import { env } from "../config/env";
import { RETRY_CONFIG } from "../config/retry";

export interface DispatchEmailJob {
  eventId: string;
  userId: string;
  channel: "email";
}

export const dispatchEmailQueue = new Queue<DispatchEmailJob>(
  "dispatch-email",
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