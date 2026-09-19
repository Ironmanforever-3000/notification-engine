import { Worker, Job } from "bullmq";
import { env } from "../config/env";

interface RouteEventJob {
  eventId: string;
  eventType: string;
  userId: string;
  payload: Record<string, unknown>;
}

const worker = new Worker<RouteEventJob>(
  "route-event",
  async (job: Job<RouteEventJob>) => {
    console.log("=================================");
    console.log("Route Event Worker received job");
    console.log("Job ID:", job.id);
    console.log("Event ID:", job.data.eventId);
    console.log("Event Type:", job.data.eventType);
    console.log("User ID:", job.data.userId);
    console.log("Payload:", job.data.payload);
    console.log("=================================");
  },
  {
    connection: {
      host: env.redisHost,
      port: env.redisPort,
    },
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error.message);
});

console.log("Route Event Worker started...");