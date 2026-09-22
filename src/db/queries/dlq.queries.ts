import { query } from "../client";

export interface CreateDlqInput {
  queueName: string;
  jobId: string;
  jobName: string;
  eventId?: string | null;
  userId?: string | null;
  channel?: string | null;
  jobData: unknown;
  failureReason: string;
  failureStack?: string | null;
  attemptsMade: number;
  maxAttempts?: number | null;
}

/**
 * Insert a failed job into the dead-letter queue.
 * ON CONFLICT DO NOTHING protects against duplicate inserts
 * if the QueueEvents listener fires more than once for the same job.
 */
export async function createDlqEntry(input: CreateDlqInput) {
  const rows = await query(
    `
    INSERT INTO dead_letter_queue (
      queue_name, job_id, job_name,
      event_id, user_id, channel,
      job_data, failure_reason, failure_stack,
      attempts_made, max_attempts
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT (queue_name, job_id) DO NOTHING
    RETURNING *
    `,
    [
      input.queueName,
      input.jobId,
      input.jobName,
      input.eventId ?? null,
      input.userId ?? null,
      input.channel ?? null,
      JSON.stringify(input.jobData),
      input.failureReason,
      input.failureStack ?? null,
      input.attemptsMade,
      input.maxAttempts ?? null,
    ]
  );
  return rows[0] ?? null;
}

/**
 * Fetch a single pending DLQ entry by ID (for replay).
 */
export async function getDlqEntryById(id: string) {
  const rows = await query(
    `SELECT * FROM dead_letter_queue WHERE id = $1 AND status = 'pending' LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

/**
 * Mark a DLQ entry as resolved after successful replay.
 */
export async function resolveDlqEntry(id: string) {
  const rows = await query(
    `UPDATE dead_letter_queue
     SET status = 'resolved', resolved_at = NOW(), updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return rows[0] ?? null;
}
