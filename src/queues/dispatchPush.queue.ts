import { Queue } from "bullmq";
import { env } from "../config/env";

export interface DispatchPushJob {
  eventId: string;
  userId: string;
  channel: "push";
}

export const dispatchPushQueue = new Queue<DispatchPushJob>("dispatch-push", {
  connection: {
    host: env.redisHost,
    port: env.redisPort,
  },
});