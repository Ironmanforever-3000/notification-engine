import { Queue } from "bullmq";
import { env } from "../config/env";

export interface RouteEventJob {
  eventId: string;
}

export const routeEventQueue = new Queue<RouteEventJob>(
  "route-event",
  {
    connection: {
      host: env.redisHost,
      port: env.redisPort
    }
  }
);