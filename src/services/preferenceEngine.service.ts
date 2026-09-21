import { query } from "../db/client";
import { getEventTypeConfig } from "../config/event-registry";
import { isInsideQuietHours } from "../utils/time";
import Redis from "ioredis";
import { env } from "../config/env";

export interface CanSendResult {
  allowed: boolean;
  reason?: string;
}

// Redis client for frequency cap counters
const redis = new Redis({ host: env.redisHost, port: env.redisPort });

/**
 * CRITICAL / REGULATORY tier events bypass user preferences, DND, quiet hours,
 * and frequency caps. Transactional and regulatory communications are generally
 * exempt from TRAI DND rules under DLT category filters.
 */
function hasComplianceExemption(tier: string): boolean {
  return tier === "CRITICAL" || tier === "REGULATORY";
}

/**
 * Main policy gate — called by the shared dispatch factory before every send.
 * Decision order (cheapest/most-likely-to-block first):
 *   1. Event config exists?
 *   2. Critical/Regulatory exemption?
 *   3. User preference opt-out
 *   4. TRAI DND
 *   5. Quiet hours (timezone-aware)
 *   6. Frequency cap
 */
export async function canSend(
  userId: string,
  eventType: string,
  channel: string
): Promise<CanSendResult> {

  // ── 1. Validate event type ──────────────────────────────────────────────────
  const eventConfig = getEventTypeConfig(eventType);
  if (!eventConfig) {
    return { allowed: false, reason: "unknown_event_type" };
  }

  const tier = eventConfig.tier;
  const exempt = hasComplianceExemption(tier);

  // ── 2. User preference opt-out (skip for critical/regulatory) ───────────────
  if (!exempt) {
    const prefRows = await query<{ enabled: boolean }>(
      `SELECT enabled FROM notification_preferences
       WHERE user_id = $1 AND event_type = $2 AND channel = $3 LIMIT 1`,
      [userId, eventType, channel]
    );
    const pref = prefRows[0];
    if (pref && pref.enabled === false) {
      return { allowed: false, reason: "user_opted_out" };
    }
  }

  // ── 3. TRAI DND check (skip for critical/regulatory) ────────────────────────
  if (!exempt) {
    const dndRows = await query<{
      is_dnd_registered: boolean;
      allowed_categories: string[] | null;
    }>(
      `SELECT is_dnd_registered, allowed_categories FROM dnd_registry
       WHERE user_id = $1 LIMIT 1`,
      [userId]
    );
    const dnd = dndRows[0];
    if (dnd?.is_dnd_registered) {
      const allowedCategories = dnd.allowed_categories ?? [];
      if (!allowedCategories.includes(eventType)) {
        return { allowed: false, reason: "trai_dnd" };
      }
    }
  }

  // ── 4. Load user timezone for quiet hours ───────────────────────────────────
  const userRows = await query<{ timezone: string }>(
    `SELECT timezone FROM users WHERE id = $1`,
    [userId]
  );
  const user = userRows[0];
  if (!user) return { allowed: false, reason: "user_not_found" };

  // ── 5. Quiet hours check (skip for critical/regulatory) ─────────────────────
  // NOTE: quiet_hours table uses start_time / end_time columns (actual schema)
  if (!exempt) {
    const quietRows = await query<{
      enabled: boolean;
      start_time: string;
      end_time: string;
    }>(
      `SELECT enabled, start_time::text, end_time::text FROM quiet_hours
       WHERE user_id = $1 LIMIT 1`,
      [userId]
    );
    const quiet = quietRows[0];
    if (quiet?.enabled) {
      // start_time comes as "HH:MM:SS" from Postgres TIME type — trim to "HH:MM"
      const start = quiet.start_time.substring(0, 5);
      const end = quiet.end_time.substring(0, 5);
      if (isInsideQuietHours(user.timezone, start, end)) {
        return { allowed: false, reason: "quiet_hours" };
      }
    }
  }

  // ── 6. Frequency cap (Redis counter) ────────────────────────────────────────
  if (!exempt) {
    const capRows = await query<{
      max_count: number;
      window_seconds: number;
    }>(
      `SELECT max_count, window_seconds FROM frequency_caps
       WHERE user_id = $1 AND (event_type = $2 OR event_type IS NULL)
         AND (channel = $3 OR channel IS NULL) AND enabled = true
       ORDER BY event_type NULLS LAST LIMIT 1`,
      [userId, eventType, channel]
    );
    const cap = capRows[0];
    if (cap) {
      const key = `freq:${userId}:${channel}:${eventType}`;
      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, cap.window_seconds);
      }
      if (current > cap.max_count) {
        return { allowed: false, reason: "frequency_capped" };
      }
    }
  }

  return { allowed: true };
}
