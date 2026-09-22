import { Router } from "express";
import { getDlqEntryById, resolveDlqEntry } from "../../db/queries/dlq.queries";
import { getQueue } from "../../services/dlq.service";
import { query } from "../../db/client";

const router = Router();

/**
 * GET /api/v1/admin/dlq
 * List pending DLQ entries (most recent first).
 */
router.get("/admin/dlq", async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT id, queue_name, job_id, channel, failure_reason,
              attempts_made, status, created_at
       FROM dead_letter_queue
       ORDER BY created_at DESC
       LIMIT 100`
    );
    return res.json({ data: rows });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/admin/dlq/:id/retry
 * Re-enqueue a pending DLQ entry into its original channel queue.
 *
 * TODO: Protect this endpoint with admin authentication in production.
 */
router.post("/admin/dlq/:id/retry", async (req, res, next) => {
  try {
    const { id } = req.params;

    const dlq: any = await getDlqEntryById(id);
    if (!dlq) {
      return res.status(404).json({ error: "DLQ_ENTRY_NOT_FOUND" });
    }

    const queue = getQueue(dlq.queue_name);

    // Parse job_data back — it was stored as a JSON string
    const jobData = typeof dlq.job_data === "string"
      ? JSON.parse(dlq.job_data)
      : dlq.job_data;

    const job = await queue.add(dlq.job_name, jobData);

    await resolveDlqEntry(id);

    return res.status(202).json({
      message: "DLQ job re-enqueued",
      dlqId: id,
      newJobId: job.id,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
