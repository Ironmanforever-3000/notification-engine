import { Queue } from "bullmq";
import { env } from "../config/env";

export interface DispatchInAppJob {
  eventId: string;
  userId: string;
  channel: "in_app";
}

export const dispatchInAppQueue = new Queue<DispatchInAppJob>("dispatch-in-app", {
  connection: { host: env.redisHost, port: env.redisPort },
});