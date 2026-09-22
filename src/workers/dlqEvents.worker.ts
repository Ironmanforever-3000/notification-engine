/**
 * DLQ Event Listener
 *
 * Listens on QueueEvents for all 5 dispatch queues.
 * When a job exhausts all retry attempts ("retries-exhausted"),
 * the full job payload is written to the dead_letter_queue table
 * for manual inspection and replay.
 *
 * Run with: npm run worker:dlq
 */

import { Queue, QueueEvents } from "bullmq";
import { env } from "../config/env";
import { createDlqEntry } from "../db/queries/dlq.queries";
import { incrementAnalytics } from "../db/queries/analytics.queries";
import { logger } from "../utils/logger";

const connection = {
  host: env.redisHost,
  port: env.redisPort,
};

const queueNames = [
  "dispatch-sms",
  "dispatch-email",
  "dispatch-push",
  "dispatch-whatsapp",
  "dispatch-in-app",
];

async function attachQueueEvents(queueName: string) {
  const queueEvents = new QueueEvents(queueName, { connection });
  await queueEvents.waitUntilReady();

  queueEvents.on(
    "retries-exhausted",
    async ({ jobId, attemptsMade }) => {
      try {
        const queue = new Queue(queueName, { connection });
        const job = await queue.getJob(jobId);

        if (!job) {
          logger.error(`DLQ: Job ${jobId} not found in ${queueName}`);
          return;
        }

        await createDlqEntry({
          queueName,
          jobId: job.id!,
          jobName: job.name,
          eventId: job.data?.eventId ?? null,
          userId: job.data?.userId ?? null,
          channel: job.data?.channel ?? null,
          jobData: job.data,
          failureReason: job.failedReason ?? "Unknown failure",
          failureStack: job.stacktrace?.join("\n") ?? null,
          attemptsMade: Number(attemptsMade),
          maxAttempts: job.opts.attempts ?? null,
        });

        // Analytics: final failure
        if (job.data?.channel) {
          // Derive event_type from the notification_events table via the eventId
          // For simplicity in the DLQ listener, use a generic event_type label
          await incrementAnalytics(
            "DLQ_FAILURE",
            job.data.channel,
            "failed"
          );
        }

        logger.info(`Moved ${queueName}/${jobId} to DLQ after ${attemptsMade} attempts`);

        await queue.close();
      } catch (error: any) {
        logger.error(`DLQ: Error processing ${queueName}/${jobId}`, {
          error: error?.message,
        });
      }
    }
  );

  queueEvents.on("error", (error) => {
    logger.error(`QueueEvents error for ${queueName}`, { error: error.message });
  });

  logger.info(`DLQ listener attached for ${queueName}`);
}

async function main() {
  for (const queueName of queueNames) {
    await attachQueueEvents(queueName);
  }
  logger.info("DLQ event listeners started for all dispatch queues");
}

main().catch((error) => {
  logger.error("DLQ startup failed", { error: error.message });
  process.exit(1);
});
