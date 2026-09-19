import { query } from "../client";

export async function insertDeliveryLog(
  notificationId: string,
  channel: string
) {
  const rows = await query(
    `
    INSERT INTO notification_deliveries
    (
      notification_id,
      channel,
      status
    )
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [
      notificationId,
      channel,
      "PENDING"
    ]
  );
  return rows[0];
}