import { query } from "../client";

export interface NotificationPreference {
  event_type: string;
  channel: string;
  enabled: boolean;
}

export async function getPreferences(
  userId: string
): Promise<NotificationPreference[]> {
  return query<NotificationPreference>(
    `
    SELECT
      event_type,
      channel,
      enabled
    FROM notification_preferences
    WHERE user_id = $1
    `,
    [userId]
  );
}