import { Queue } from "bullmq";
import { env } from "../config/env";
import { RETRY_CONFIG } from "../config/retry";

export interface DispatchWhatsappJob {
  eventId: string;
  userId: string;
  channel: "whatsapp";
}

export const dispatchWhatsappQueue = new Queue<DispatchWhatsappJob>(
  "dispatch-whatsapp",
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