import { Worker, Job, UnrecoverableError } from "bullmq";
import { env } from "../config/env";
import { query } from "../db/client";
import { createInAppNotification } from "../services/channels/inApp.service";
import { acquireIdempotencyLock } from "../utils/idempotency";
import { createDelivery } from "../db/queries/delivery.queries";
import { createSuppression } from "../db/queries/suppression.queries";
import { incrementAnalytics } from "../db/queries/analytics.queries";
import { canSend } from "../services/preferenceEngine.service";
import { render } from "../services/templateEngine.service";
import { incrementLiveCounter } from "../services/liveAnalytics.service";
import { getUserById } from "../db/queries/user.queries";
import { NonRetryableProviderError } from "../types/delivery.types";
import { logger } from "../utils/logger";

interface DispatchInAppJob {
  eventId: string;
  userId: string;
  channel: "in_app";
}

interface EventRow {
  id: string;
  event_type: string;
  payload: Record<string, unknown>;
}

const worker = new Worker<DispatchInAppJob>(
  "dispatch-in-app",
  async (job: Job<DispatchInAppJob>) => {
    const { eventId, userId, channel } = job.data;

    // 1. Load event
    const eventRows = await query<EventRow>(
      `SELECT id, event_type, payload FROM notification_events WHERE id = $1`,
      [eventId]
    );
    const event = eventRows[0];
    if (!event) throw new Error(`Event ${eventId} not found`);

    // 2. Load user
    const user = await getUserById(userId);
    if (!user) throw new Error(`User ${userId} not found`);

    // 3. Policy gate
    const policy = await canSend(userId, event.event_type, channel);
    if (!policy.allowed) {
      await createSuppression({
        eventId, userId, eventType: event.event_type,
        channel, reason: policy.reason ?? "blocked",
      });
      await incrementAnalytics(event.event_type, channel, "suppressed");
      logger.info("In-app notification suppressed", { eventId, userId, reason: policy.reason });
      return;
    }

    // 4. Idempotency
    const lockAcquired = await acquireIdempotencyLock(eventId, channel, userId);
    if (!lockAcquired) {
      await createDelivery({ eventId, userId, channel, status: "skipped_duplicate" });
      return;
    }

    // 5. Render personalised template
    const locale = user.locale?.split("-")[0] ?? "en";
    const rendered = await render(event.event_type, channel, locale, {
      ...event.payload,
      user: { name: user.name },
    });

    const title = rendered.subject ?? `Financial Alert: ${event.event_type}`;
    const body = rendered.body;

    try {
      await createInAppNotification({ userId, eventId, title, body });
      await createDelivery({
        eventId, userId, channel, status: "sent",
        providerResponse: { provider: "internal" },
      });
      // Analytics: sent
      await incrementAnalytics(event.event_type, channel, "sent");
      await incrementLiveCounter(channel);
      logger.info("In-app notification created", { eventId, userId });
    } catch (error: any) {
      await createDelivery({
        eventId, userId, channel, status: "failed",
        providerResponse: { reason: error?.message ?? "In-app notification failed" },
      });

      logger.error("In-app notification failed", { eventId, userId, error: error?.message });

      // Non-retryable → skip remaining retries
      if (error instanceof NonRetryableProviderError) {
        throw new UnrecoverableError(error.message);
      }

      // Retryable → re-throw for BullMQ retry
      throw error;
    }
  },
  {
    connection: { host: env.redisHost, port: env.redisPort },
    limiter: { max: 100, duration: 1000 }, // 100/sec for in-app
  }
);

worker.on("completed", (job) => console.log(`In-app job ${job.id} completed`));
worker.on("failed", (job, error) => console.error(`In-app job ${job?.id} failed:`, error.message));
console.log("In-app dispatch worker started");