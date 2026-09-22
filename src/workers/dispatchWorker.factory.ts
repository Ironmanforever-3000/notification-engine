import { Worker, Job, UnrecoverableError } from "bullmq";
import { env } from "../config/env";
import { query } from "../db/client";
import { getUserById } from "../db/queries/user.queries";
import { createDelivery } from "../db/queries/delivery.queries";
import { createSuppression } from "../db/queries/suppression.queries";
import { incrementAnalytics } from "../db/queries/analytics.queries";
import { acquireIdempotencyLock } from "../utils/idempotency";
import { canSend } from "../services/preferenceEngine.service";
import { render } from "../services/templateEngine.service";
import { incrementLiveCounter } from "../services/liveAnalytics.service";
import { NonRetryableProviderError } from "../types/delivery.types";
import { logger } from "../utils/logger";

export interface DispatchJob {
  eventId: string;
  userId: string;
  channel: string;
}

export interface DispatchSendResult {
  providerMessageId?: string;
  providerResponse?: unknown;
}

export interface DispatchWorkerConfig {
  queueName: string;
  channel: string;

  /** Provider-specific rate limit (jobs per second). */
  rateLimitPerSecond?: number;

  send: (
    destination: string,
    message: string,
    subject?: string
  ) => Promise<DispatchSendResult>;

  getDestination: (user: {
    email: string;
    phone: string | null;
    fcm_token: string | null;
  }) => string | null;
}

interface EventRow {
  id: string;
  event_type: string;
  user_id: string;
  payload: Record<string, unknown>;
}

export function createDispatchWorker(config: DispatchWorkerConfig) {
  return new Worker<DispatchJob>(
    config.queueName,
    async (job: Job<DispatchJob>) => {
      const { eventId, userId, channel } = job.data;

      logger.info("Dispatch worker started", { jobId: job.id, eventId, userId, channel });

      // ── 1. Load event ──────────────────────────────────────────────────────
      const eventRows = await query<EventRow>(
        `SELECT id, event_type, user_id, payload FROM notification_events WHERE id = $1`,
        [eventId]
      );
      const event = eventRows[0];
      if (!event) throw new Error(`Event ${eventId} not found`);

      // ── 2. Load user ───────────────────────────────────────────────────────
      const user = await getUserById(userId);
      if (!user) throw new Error(`User ${userId} not found`);

      // ── 3. Policy gate: canSend() ──────────────────────────────────────────
      const policy = await canSend(userId, event.event_type, channel);
      if (!policy.allowed) {
        await createSuppression({
          eventId,
          userId,
          eventType: event.event_type,
          channel,
          reason: policy.reason ?? "blocked",
        });
        // Analytics: suppressed
        await incrementAnalytics(event.event_type, channel, "suppressed");
        logger.info("Notification suppressed", {
          eventId, userId, channel, reason: policy.reason,
        });
        return;
      }

      // ── 4. Get destination ─────────────────────────────────────────────────
      const destination = config.getDestination(user);
      if (!destination) {
        await createDelivery({
          eventId,
          userId,
          channel,
          status: "failed",
          providerResponse: { reason: "DESTINATION_NOT_AVAILABLE" },
        });
        await incrementAnalytics(event.event_type, channel, "failed");
        return;
      }

      // ── 5. Idempotency lock ────────────────────────────────────────────────
      const lockAcquired = await acquireIdempotencyLock(eventId, channel, userId);
      if (!lockAcquired) {
        logger.info("Duplicate notification skipped", { eventId, userId, channel });
        await createDelivery({ eventId, userId, channel, status: "skipped_duplicate" });
        return;
      }

      // ── 6. Render personalised template ───────────────────────────────────
      const locale = user.locale?.split("-")[0] ?? "en";
      const rendered = await render(
        event.event_type,
        channel,
        locale,
        {
          ...event.payload,
          user: { name: user.name },
        }
      );

      // ── 7. Send via provider ───────────────────────────────────────────────
      try {
        const result = await config.send(
          destination,
          rendered.body,
          rendered.subject
        );

        await createDelivery({
          eventId,
          userId,
          channel,
          status: "sent",
          providerMessageId: result.providerMessageId,
          providerResponse: result.providerResponse,
        });

        // Analytics: sent (final outcome)
        await incrementAnalytics(event.event_type, channel, "sent");
        await incrementLiveCounter(channel);

        logger.info("Notification sent", {
          eventId, userId, channel,
          providerMessageId: result.providerMessageId,
        });
        return result;
      } catch (error: any) {
        // Log the delivery failure attempt
        await createDelivery({
          eventId,
          userId,
          channel,
          status: "failed",
          providerResponse: {
            retryable: error?.retryable ?? false,
            reason: error?.message ?? "Provider error",
            providerCode: error?.providerCode,
          },
        });

        logger.error("Notification provider failed", {
          eventId, userId, channel, error: error?.message,
        });

        // Non-retryable → skip remaining retries via UnrecoverableError
        if (error instanceof NonRetryableProviderError) {
          throw new UnrecoverableError(error.message);
        }

        // Retryable → re-throw so BullMQ applies exponential backoff
        throw error;
      }
    },
    {
      connection: { host: env.redisHost, port: env.redisPort },
      ...(config.rateLimitPerSecond
        ? { limiter: { max: config.rateLimitPerSecond, duration: 1000 } }
        : {}),
    }
  );
}