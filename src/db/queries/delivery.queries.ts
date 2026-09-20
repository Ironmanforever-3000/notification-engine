import { query } from "../client";

export interface CreateDeliveryInput {
  eventId: string;
  userId: string;
  channel: string;
  status: string;
  providerMessageId?: string | null;
  providerResponse?: any;
}

export async function createDelivery(input: CreateDeliveryInput) {
  // 1. First ensure an intermediate `notifications` record exists for this event
  const notifRows = await query(
    `
    INSERT INTO notifications (event_id, user_id, event_type, status)
    VALUES ($1, $2, 'DISPATCH', $3)
    RETURNING id
    `,
    [input.eventId, input.userId, input.status]
  );
  
  const notificationId = notifRows[0].id;

  // 2. Extract specific error properties to match the exact DB schema
  let errorCode = null;
  let errorMessage = null;

  if (input.providerResponse) {
    errorCode = input.providerResponse.providerCode ? String(input.providerResponse.providerCode) : null;
    errorMessage = input.providerResponse.reason ? String(input.providerResponse.reason) : JSON.stringify(input.providerResponse);
  }

  // 3. Insert into the delivery tracking table
  const rows = await query(
    `
    INSERT INTO notification_deliveries
    (
      notification_id,
      channel,
      status,
      provider_message_id,
      error_code,
      error_message
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
    `,
    [
      notificationId,
      input.channel,
      input.status,
      input.providerMessageId || null,
      errorCode,
      errorMessage
    ]
  );

  return rows[0];
}