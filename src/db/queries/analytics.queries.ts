import { query } from "../client";

type AnalyticsStatus = "sent" | "delivered" | "failed" | "suppressed";

/**
 * Atomically increment an analytics counter for the current hour.
 *
 * Uses INSERT ... ON CONFLICT DO UPDATE (UPSERT) so a single SQL call
 * either creates or increments the row. The status column name is safe
 * because it's controlled by a TypeScript union, not user input.
 */
export async function incrementAnalytics(
  eventType: string,
  channel: string,
  status: AnalyticsStatus
) {
  // Build the column name from the union type
  const column = `${status}_count`;

  const rows = await query(
    `
    INSERT INTO analytics_hourly (
      hour_bucket, event_type, channel, ${column}
    )
    VALUES (
      date_trunc('hour', NOW()), $1, $2, 1
    )
    ON CONFLICT (hour_bucket, event_type, channel)
    DO UPDATE SET ${column} = analytics_hourly.${column} + 1
    RETURNING *
    `,
    [eventType, channel]
  );
  return rows[0];
}
