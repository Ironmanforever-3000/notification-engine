import { Queue } from "bullmq";
import { env } from "../config/env";

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
  }
);