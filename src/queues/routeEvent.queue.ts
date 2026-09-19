import { Queue } from "bullmq";
import { env } from "../config/env";

export const routeEventQueue = new Queue(
  "route-event",
  {
    connection: {
      host: env.redisHost,
      port: env.redisPort,
    },
  }
);