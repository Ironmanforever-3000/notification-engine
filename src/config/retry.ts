/**
 * Centralized retry configuration for all BullMQ dispatch queues.
 *
 * All 5 channel queues (SMS, Email, Push, WhatsApp, In-App) import
 * this config via `defaultJobOptions` so retry values are never duplicated.
 *
 * Backoff schedule:  2s → 4s → 8s → 16s → 32s  (total ≈ 62 seconds)
 */
export const RETRY_CONFIG = {
  attempts: 5,
  backoff: {
    type: "exponential" as const,
    delay: 2000, // seed delay in ms
  },
  removeOnComplete: 1000, // keep last 1000 completed jobs for inspection
  removeOnFail: false,    // keep failed jobs so DLQ listener can read them
};
