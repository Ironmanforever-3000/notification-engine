import { query } from "../client";

export interface EventRow {
  id: string;
  event_type: string;
  user_id: string;
  payload: Record<string, unknown>;
  priority: string;
  correlation_id: string | null;
  created_at: Date;
}

export async function insertEvent(
  event: {
    event_type: string;
    user_id: string;
    payload: Record<string, unknown>;
    priority?: string;
    correlation_id?: string;
  }
): Promise<EventRow> {
  const rows = await query<EventRow>(
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