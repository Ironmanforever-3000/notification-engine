import { query } from "../db/client";

/**
 * Aggregated analytics summary grouped by channel.
 */
export async function getAnalyticsSummary(
  from: string,
  to: string,
  channel?: string
) {
  const params: unknown[] = [from, to];
  let channelFilter = "";

  if (channel) {
    params.push(channel);
    channelFilter = `AND channel = $${params.length}`;
  }

  const rows = await query(
    `
    SELECT
      channel,
      SUM(sent_count)::int       AS sent_count,
      SUM(delivered_count)::int  AS delivered_count,
      SUM(failed_count)::int     AS failed_count,
      SUM(suppressed_count)::int AS suppressed_count
    FROM analytics_hourly
    WHERE hour_bucket >= $1
      AND hour_bucket < $2
      ${channelFilter}
    GROUP BY channel
    ORDER BY channel
    `,
    params
  );
  return rows;
}

/**
 * Aggregated analytics summary grouped by event type.
 */
export async function getAnalyticsByEventType(
  from: string,
  to: string
) {
  const rows = await query(
    `
    SELECT
      event_type,
      SUM(sent_count)::int       AS sent_count,
      SUM(delivered_count)::int  AS delivered_count,
      SUM(failed_count)::int     AS failed_count,
      SUM(suppressed_count)::int AS suppressed_count
    FROM analytics_hourly
    WHERE hour_bucket >= $1
      AND hour_bucket < $2
    GROUP BY event_type
    ORDER BY sent_count DESC
    `,
    [from, to]
  );
  return rows;
}

/**
 * DLQ rate metrics for a given time range.
 */
export async function getDlqRate(from: string, to: string) {
  const rows = await query(
    `
    SELECT
      COUNT(*) FILTER (WHERE status = 'pending')::int  AS pending_dlq,
      COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved_dlq,
      COUNT(*)::int                                     AS total_dlq
    FROM dead_letter_queue
    WHERE created_at >= $1
      AND created_at < $2
    `,
    [from, to]
  );
  return rows[0];
}
