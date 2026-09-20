import { query } from "../../db/client";

export interface CreateInAppNotification {
  userId: string;
  eventId: string;
  title: string;
  body: string;
}

export async function createInAppNotification(input: CreateInAppNotification) {
  const rows = await query(
    `INSERT INTO in_app_notifications (user_id, event_id, title, body) VALUES ($1, $2, $3, $4) RETURNING *`,
    [input.userId, input.eventId, input.title, input.body]
  );
  return rows[0];
}