import { Queue } from "bullmq";
import { env } from "../config/env";

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
  }
);