import { Worker, Job } from "bullmq";
import { env } from "../config/env";
import { query } from "../db/client";
import { logger } from "../utils/logger";
import { routeEvent } from "../services/routing.service";

export interface RouteEventJob {
  eventId: string;
}

interface EventRow {
  id: string;
  event_type: string;
  user_id: string;
  payload: Record<string, unknown>;
  priority: string;
  correlation_id: string | null;
  created_at: Date;
}

const worker = new Worker<RouteEventJob>(
  "route-event",
  async (job: Job<RouteEventJob>) => {
    const { eventId } = job.data;
    logger.info("Processing route-event job", { jobId: job.id, eventId });

    const rows = await query<EventRow>(
      `
      SELECT
        id,
        event_type,
        user_id,
        payload,
        priority,
        correlation_id,
        created_at
      FROM notification_events
      WHERE id = $1
      `,
      [eventId]
    );

    const event = rows[0];

    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }

    logger.info("Event loaded", {
      eventId: event.id,
      eventType: event.event_type,
      userId: event.user_id,
    });

    const routingResult = await routeEvent({
      eventId: event.id,
      eventType: event.event_type,
      userId: event.user_id,
    });

    logger.info("Event routing completed", {
      eventId: event.id,
      channels: routingResult.channels,
    });

    return routingResult;
  },
  {
    connection: {
      host: env.redisHost,
      port: env.redisPort,
    }
  }
);

worker.on("completed", (job) => {
  logger.info("Route event job completed", { jobId: job.id });
});

worker.on("failed", (job, error) => {
  logger.error("Route event job failed", { jobId: job?.id, error: error.message });
});

logger.info("Route Event Worker started");