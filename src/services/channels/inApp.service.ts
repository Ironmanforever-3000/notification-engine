import { query } from "../../db/client";
import { RetryableProviderError } from "../../types/delivery.types";

export interface CreateInAppNotification {
  userId: string;
  eventId: string;
  title: string;
  body: string;
}

export async function createInAppNotification(input: CreateInAppNotification) {
  try {
    const rows = await query(
      `INSERT INTO in_app_notifications (user_id, event_id, title, body) VALUES ($1, $2, $3, $4) RETURNING *`,
      [input.userId, input.eventId, input.title, input.body]
    );
    return rows[0];
  } catch (error: any) {
    // Database errors are transient (connection issues, deadlocks) — retryable
    throw new RetryableProviderError(
      error.message ?? "In-app DB write failed",
      error?.code
    );
  }
}