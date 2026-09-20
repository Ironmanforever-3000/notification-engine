import { query } from "../client";

export async function getUserInAppNotifications(userId: string) {
  return query(
    `SELECT id, event_id, title, body, read, created_at FROM in_app_notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
    [userId]
  );
}