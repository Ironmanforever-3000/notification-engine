import { Router } from "express";
import {
  getAnalyticsSummary,
  getAnalyticsByEventType,
  getDlqRate,
} from "../../services/analytics.service";
import { getLiveCounters } from "../../services/liveAnalytics.service";

const router = Router();

/**
 * GET /api/v1/analytics/summary?from=...&to=...&channel=...
 * Aggregated notification metrics grouped by channel.
 */
router.get("/analytics/summary", async (req, res, next) => {
  try {
    const from = String(req.query.from ?? "");
    const to = String(req.query.to ?? "");
    const channel = req.query.channel ? String(req.query.channel) : undefined;

    if (!from || !to) {
      return res.status(400).json({ error: "from and to query params are required" });
    }

    const data = await getAnalyticsSummary(from, to, channel);
    return res.json({ from, to, channel: channel ?? "all", data });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/analytics/by-event-type?from=...&to=...
 * Aggregated notification metrics grouped by event type.
 */
router.get("/analytics/by-event-type", async (req, res, next) => {
  try {
    const from = String(req.query.from ?? "");
    const to = String(req.query.to ?? "");

    if (!from || !to) {
      return res.status(400).json({ error: "from and to query params are required" });
    }

    const data = await getAnalyticsByEventType(from, to);
    return res.json({ from, to, data });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/analytics/dlq-rate?from=...&to=...
 * DLQ metrics: pending, resolved, total.
 */
router.get("/analytics/dlq-rate", async (req, res, next) => {
  try {
    const from = String(req.query.from ?? "");
    const to = String(req.query.to ?? "");

    if (!from || !to) {
      return res.status(400).json({ error: "from and to query params are required" });
    }

    const data = await getDlqRate(from, to);
    return res.json({ from, to, data });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/analytics/live
 * Real-time counters from Redis (last ~60 seconds).
 */
router.get("/analytics/live", async (_req, res, next) => {
  try {
    const data = await getLiveCounters();
    return res.json({ data });
  } catch (error) {
    next(error);
  }
});

export default router;
