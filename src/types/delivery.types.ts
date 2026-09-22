/**
 * Typed provider errors for the dispatch pipeline.
 *
 * Channel services throw these instead of plain objects so that:
 *  - `instanceof` checks work in the dispatch worker factory
 *  - BullMQ's `UnrecoverableError` can be used for permanent failures
 *  - Stack traces are preserved
 */

export interface ProviderErrorInfo {
  retryable: boolean;
  reason: string;
  providerCode?: string | number;
}

/**
 * Throw when a provider fails transiently (network timeout, rate limit, etc.).
 * BullMQ will retry the job according to the configured backoff schedule.
 */
export class RetryableProviderError extends Error {
  readonly retryable = true;
  readonly providerCode?: string | number;

  constructor(message: string, providerCode?: string | number) {
    super(message);
    this.name = "RetryableProviderError";
    this.providerCode = providerCode;
  }
}

/**
 * Throw when a provider fails permanently (invalid phone, auth failure, etc.).
 * The dispatch worker factory converts this to BullMQ's UnrecoverableError
 * so the job goes directly to failed state without consuming retries.
 */
export class NonRetryableProviderError extends Error {
  readonly retryable = false;
  readonly providerCode?: string | number;

  constructor(message: string, providerCode?: string | number) {
    super(message);
    this.name = "NonRetryableProviderError";
    this.providerCode = providerCode;
  }
}
