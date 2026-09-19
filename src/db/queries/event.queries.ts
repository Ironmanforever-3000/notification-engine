import { query } from "../client";
import { FinancialEvent } from "../../types/event.types";

export async function insertEvent(
  event: FinancialEvent
): Promise<FinancialEvent> {
  const rows = await query<FinancialEvent>(
    `
    INSERT INTO notification_events
    (
      event_type,
      user_id,
      payload,
      priority,
      correlation_id
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING
      id,
      event_type,
      user_id,
      payload,
      priority,
      correlation_id,
      created_at
    `,
    [
      event.event_type,
      event.user_id,
      JSON.stringify(event.payload),
      event.priority ?? "NORMAL",
      event.correlation_id ?? null
    ]
  );
  return rows[0];
}