/**
 * Channels for notification delivery.
 */
export enum Channel {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  WHATSAPP = 'WHATSAPP',
  IN_APP = 'IN_APP',
}

/**
 * Priority tiers for event types.
 */
export enum Tier {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  NORMAL = 'NORMAL',
  LOW = 'LOW',
  REGULATORY = 'REGULATORY',
}

/**
 * Status of a notification record.
 */
export enum NotificationStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/**
 * Subtype for transaction events.
 */
export enum TransactionSubType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

/**
 * Union type of all supported event names.
 */
export type EventTypeName =
  | 'MARGIN_CALL'
  | 'ACCOUNT_FRAUD_ALERT'
  | 'KYC_EXPIRY_URGENT'
  | 'LARGE_WITHDRAWAL_ALERT'
  | 'LOGIN_FROM_NEW_DEVICE'
  | 'TRANSACTION_ALERT'
  | 'PRICE_ALERT_TRIGGERED'
  | 'ORDER_EXECUTED'
  | 'ORDER_FAILED'
  | 'PAYMENT_DUE_TOMORROW'
  | 'LOW_BALANCE_WARNING'
  | 'SIP_EXECUTED'
  | 'SIP_REMINDER'
  | 'PORTFOLIO_WEEKLY_SUMMARY'
  | 'DIVIDEND_CREDITED'
  | 'NEW_IPO_AVAILABLE'
  | 'RECOMMENDED_FUND_UPDATE'
  | 'GOAL_PROGRESS_UPDATE'
  | 'TAX_STATEMENT_READY'
  | 'INTEREST_CREDITED'
  | 'PROMOTIONAL_OFFER'
  | 'REFERRAL_BONUS'
  | 'APP_FEATURE_ANNOUNCEMENT'
  | 'SURVEY_REQUEST'
  | 'NOMINEE_UPDATE_REQUIRED'
  | 'REGULATORY_NOTICE'
  | 'KYC_DOCUMENT_REQUIRED'
  | 'ANNUAL_STATEMENT_AVAILABLE';

/**
 * Configuration for a specific event type.
 */
export interface EventTypeConfig {
  event_type: EventTypeName;
  tier: Tier;
  default_channels: Channel[];
  description: string;
  bypass_dnd: boolean;
  bypass_quiet_hours: boolean;
  bypass_frequency_cap: boolean;
  requires_optin: boolean;
}

/**
 * Payload representing a raw notification event.
 */
export interface NotificationEvent {
  id: string;
  event_type: EventTypeName;
  user_id: string;
  payload: Record<string, unknown>;
  timestamp: Date;
  idempotency_key: string;
  sub_type?: TransactionSubType;
}

/**
 * Record representing a notification in the system.
 */
export interface NotificationRecord {
  id: string;
  user_id: string;
  event_type: EventTypeName;
  channel: Channel;
  status: NotificationStatus;
  payload: Record<string, unknown>;
  template_id?: string;
  scheduled_at?: Date;
  sent_at?: Date;
  delivered_at?: Date;
  failed_at?: Date;
  retry_count: number;
  max_retries: number;
  next_retry_at?: Date;
  error_message?: string;
  idempotency_key: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * User preferences for receiving notifications.
 */
export interface UserPreference {
  user_id: string;
  event_type: EventTypeName;
  channel: Channel;
  enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

/**
 * User profile entity.
 */
export interface User {
  id: string;
  email: string;
  phone?: string;
  device_token?: string;
  whatsapp_number?: string;
  locale: string;
  timezone: string;
  dnd_enabled: boolean;
  marketing_optin: boolean;
  created_at: Date;
  updated_at: Date;
}
