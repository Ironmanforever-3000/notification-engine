import { Worker, Job } from "bullmq";
import { env } from "../config/env";
import { query } from "../db/client";
import { getUserById } from "../db/queries/user.queries";
import { createDelivery } from "../db/queries/delivery.queries";
import { sendEmail } from "../services/channels/email.service";
import { acquireIdempotencyLock } from "../utils/idempotency";
import { logger } from "../utils/logger";
import { DispatchEmailJob } from "../queues/dispatchEmail.queue";

const worker = new Worker<DispatchEmailJob>(
  "dispatch-email",
  async (job: Job<DispatchEmailJob>) => {
    const { eventId, userId, channel } = job.data;
    logger.info("Email dispatch started", { jobId: job.id, eventId, userId, channel });

    const eventRows = await query<{
      id: string;
      event_type: string;
      payload: Record<string, unknown>;
    }>(
      `
      SELECT id, event_type, payload
      FROM notification_events
      WHERE id = $1
      `,
      [eventId]
    );

    const event = eventRows[0];
    if (!event) throw new Error(`Event ${eventId} not found`);

    const user = await getUserById(userId);
    if (!user) throw new Error(`User ${userId} not found`);

    if (!user.email) {
      await createDelivery({
        eventId,
        userId,
        channel,
        status: "failed",
        providerResponse: { reason: "USER_EMAIL_NOT_AVAILABLE" },
      });
      return;
    }

    const lockAcquired = await acquireIdempotencyLock(eventId, channel, userId);
    if (!lockAcquired) {
      logger.info("Duplicate Email detected", { eventId, userId, channel });
      await createDelivery({ eventId, userId, channel, status: "skipped_duplicate" });
      return;
    }

    const subject = `Alert: ${event.event_type}`;
    const body = `Hello ${user.name},\n\nYou have a new notification regarding your account: ${event.event_type}.`;

    try {
      const result = await sendEmail(user.email, subject, body);
      await createDelivery({
        eventId,
        userId,
        channel,
        status: "sent",
        providerMessageId: result.providerMessageId,
        providerResponse: result.providerResponse,
      });
      logger.info("Email sent successfully", { eventId, userId, providerMessageId: result.providerMessageId });
    } catch (error: any) {
      await createDelivery({
        eventId,
        userId,
        channel,
        status: "failed",
        providerResponse: {
          retryable: error?.retryable ?? false,
          reason: error?.reason ?? "Email provider error",
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

worker.on("completed", (job) => logger.info("Email dispatch job completed", { jobId: job.id }));
worker.on("failed", (job, error) => logger.error("Email dispatch job failed", { jobId: job?.id, error: error.message }));

logger.info("Email dispatch worker started");
