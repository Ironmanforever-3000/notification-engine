export type EventTier =
  | "CRITICAL"
  | "HIGH"
  | "NORMAL"
  | "LOW"
  | "REGULATORY";

export interface FinancialEvent {
  id?: string;
  event_type: string;
  user_id: string;
  payload: Record<string, unknown>;
  priority?: EventTier;
  correlation_id?: string;
  created_at?: Date;
}