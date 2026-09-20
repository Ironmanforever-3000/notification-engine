import { query } from "../client";

export interface CreateDeliveryInput {
  eventId: string;
  userId: string;
  channel: string;
  status: string;
  providerMessageId?: string | null;
  providerResponse?: unknown;
}

export async function createDelivery(input: CreateDeliveryInput) {
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
      input.eventId,
      input.channel,
      input.status
    ]
  );
  return rows[0];
}