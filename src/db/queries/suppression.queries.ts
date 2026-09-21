import { query } from "../client";

export interface CreateSuppressionInput {
  eventId: string;
  userId: string;
  eventType: string;
  channel: string;
  reason: string;
}

export async function createSuppression(input: CreateSuppressionInput) {
  const rows = await query(
    `INSERT INTO suppressed_notifications
     (event_id, user_id, event_type, channel, reason)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [input.eventId, input.userId, input.eventType, input.channel, input.reason]
  );
  return rows[0];
}
