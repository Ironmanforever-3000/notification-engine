import { Worker, Job } from "bullmq";
import { env } from "../config/env";
import { query } from "../db/client";
import { createInAppNotification } from "../services/channels/inApp.service";
import { acquireIdempotencyLock } from "../utils/idempotency";
import { createDelivery } from "../db/queries/delivery.queries";
import { logger } from "../utils/logger";

interface DispatchInAppJob {
  eventId: string;
  userId: string;
  channel: "in_app";
}

interface EventRow {
  id: string;
  event_type: string;
}

const worker = new Worker<DispatchInAppJob>(
  "dispatch-in-app",
  async (job: Job<DispatchInAppJob>) => {
    const { eventId, userId, channel } = job.data;
    
    const eventRows = await query<EventRow>(`SELECT id, event_type FROM notification_events WHERE id = $1`, [eventId]);
    const event = eventRows[0];
    if (!event) throw new Error(`Event ${eventId} not found`);

    const lockAcquired = await acquireIdempotencyLock(eventId, channel, userId);
    if (!lockAcquired) {
      await createDelivery({ eventId, userId, channel, status: "skipped_duplicate" });
      return;
    }

    const title = `Financial Alert: ${event.event_type}`;
    const body = `Notification: ${event.event_type}`;

    try {
      await createInAppNotification({ userId, eventId, title, body });
      await createDelivery({
        eventId,
        userId,
        channel,
        status: "sent",
        providerResponse: { provider: "internal" },
      });
      logger.info("In-app notification created", { eventId, userId });
    } catch (error: any) {
      await createDelivery({
        eventId,
        userId,
        channel,
        status: "failed",
        providerResponse: { reason: error?.message ?? "In-app notification failed" },
      });
      throw error;
    }
  },
  { connection: { host: env.redisHost, port: env.redisPort } }
);

worker.on("completed", (job) => console.log(`In-app job ${job.id} completed`));
worker.on("failed", (job, error) => console.error(`In-app job ${job?.id} failed:`, error.message));
console.log("In-app dispatch worker started");