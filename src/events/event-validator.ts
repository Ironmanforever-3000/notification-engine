import { z } from 'zod';
import { NotificationEvent } from './types';

/**
 * All valid event type names for schema validation.
 */
const VALID_EVENT_TYPES = [
  'MARGIN_CALL',
  'ACCOUNT_FRAUD_ALERT',
  'KYC_EXPIRY_URGENT',
  'LARGE_WITHDRAWAL_ALERT',
  'LOGIN_FROM_NEW_DEVICE',
  'TRANSACTION_ALERT',
  'PRICE_ALERT_TRIGGERED',
  'ORDER_EXECUTED',
  'ORDER_FAILED',
  'PAYMENT_DUE_TOMORROW',
  'LOW_BALANCE_WARNING',
  'SIP_EXECUTED',
  'SIP_REMINDER',
  'PORTFOLIO_WEEKLY_SUMMARY',
  'DIVIDEND_CREDITED',
  'NEW_IPO_AVAILABLE',
  'RECOMMENDED_FUND_UPDATE',
  'GOAL_PROGRESS_UPDATE',
  'TAX_STATEMENT_READY',
  'INTEREST_CREDITED',
  'PROMOTIONAL_OFFER',
  'REFERRAL_BONUS',
  'APP_FEATURE_ANNOUNCEMENT',
  'SURVEY_REQUEST',
  'NOMINEE_UPDATE_REQUIRED',
  'REGULATORY_NOTICE',
  'KYC_DOCUMENT_REQUIRED',
  'ANNUAL_STATEMENT_AVAILABLE',
] as const;

const SUB_TYPES = ['DEBIT', 'CREDIT'] as const;

/**
 * Zod schema for validating incoming notification events.
 *
 * - `id` and `idempotency_key` are optional; they can be generated
 *   by the system if not provided by the caller.
 * - `event_type` is validated against the canonical 28 event types.
 * - `timestamp` coerces ISO strings to Date objects.
 */
export const notificationEventSchema = z.object({
  id: z.string().uuid().optional(),
  event_type: z.enum(VALID_EVENT_TYPES),
  user_id: z.string().uuid(),
  payload: z.record(z.string(), z.unknown()),
  timestamp: z.coerce.date().optional(),
  idempotency_key: z.string().min(1).optional(),
  sub_type: z.enum(SUB_TYPES).optional(),
});

/** Inferred type from the schema. */
export type ValidatedEvent = z.infer<typeof notificationEventSchema>;

/**
 * Validates an unknown payload against the notification event schema.
 *
 * @param data - The raw data to validate.
 * @returns An object with `success`, optional parsed `data`, and optional `errors`.
 */
export function validateEvent(
  data: unknown,
): { success: boolean; data?: NotificationEvent; errors?: string[] } {
  const result = notificationEventSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data as unknown as NotificationEvent };
  }
  return {
    success: false,
    errors: result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
  };
}

