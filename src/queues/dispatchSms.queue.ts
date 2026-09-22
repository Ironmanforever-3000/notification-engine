import { Queue } from "bullmq";
import { env } from "../config/env";
import { RETRY_CONFIG } from "../config/retry";

export interface DispatchSmsJob {
  eventId: string;
  userId: string;
  channel: "sms";
}

export const dispatchSmsQueue = new Queue<DispatchSmsJob>(
  "dispatch-sms",
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