import { Worker, Job } from "bullmq";
import { env } from "../config/env";
import { query } from "../db/client";
import { getUserById } from "../db/queries/user.queries";
import { createDelivery } from "../db/queries/delivery.queries";
import { acquireIdempotencyLock } from "../utils/idempotency";
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

export interface DispatchError {
  retryable: boolean;
  reason: string;
  providerCode?: string | number;
}

export interface DispatchWorkerConfig {
  queueName: string;
  channel: string;

  send: (
    destination: string,
    message: string,
    subject?: string
  ) => Promise<DispatchSendResult>;

  getDestination: (user: { email: string; phone: string | null; fcm_token: string | null }) => string | null;
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

      // 1. Fetch event
      const eventRows = await query<EventRow>(
        `SELECT id, event_type, user_id, payload FROM notification_events WHERE id = $1`,
        [eventId]
      );
      const event = eventRows[0];
      if (!event) throw new Error(`Event ${eventId} not found`);

      // 2. Fetch user
      const user = await getUserById(userId);
      if (!user) throw new Error(`User ${userId} not found`);

      // 3. Get destination
      const destination = config.getDestination(user);
      if (!destination) {
        await createDelivery({
          eventId,
          userId,
          channel,
          status: "failed",
          providerResponse: { reason: "DESTINATION_NOT_AVAILABLE" },
        });
        return;
      }

      // 4. Idempotency
      const lockAcquired = await acquireIdempotencyLock(eventId, channel, userId);
      if (!lockAcquired) {
        logger.info("Duplicate notification skipped", { eventId, userId, channel });
        await createDelivery({ eventId, userId, channel, status: "skipped_duplicate" });
        return;
      }

      // 5. Temporary message
      const message = `Notification: ${event.event_type}`;
      const subject = `Financial Alert: ${event.event_type}`;

      // 6. Provider send
      try {
        const result = await config.send(destination, message, subject);
        
        // 7. Delivery tracking
        await createDelivery({
          eventId,
          userId,
          channel,
          status: "sent",
          providerMessageId: result.providerMessageId,
          providerResponse: result.providerResponse,
        });

        logger.info("Notification sent", { eventId, userId, channel, providerMessageId: result.providerMessageId });
        return result;
      } catch (error: any) {
        await createDelivery({
          eventId,
          userId,
          channel,
          status: "failed",
          providerResponse: {
            retryable: error?.retryable ?? false,
            reason: error?.reason ?? "Provider error",
            providerCode: error?.providerCode,
          },
        });
        throw error;
      }
    },
    {
      connection: { host: env.redisHost, port: env.redisPort }
    }
  );
}