# Retry Strategy

## Exponential Backoff

All dispatch queues use exponential backoff with a seed delay of **2 seconds**:

```
Attempt 1 → failure → wait 2s
Attempt 2 → failure → wait 4s
Attempt 3 → failure → wait 8s
Attempt 4 → failure → wait 16s
Attempt 5 → failure → FINAL FAILURE → DLQ
```

Total worst-case wait: **~62 seconds** before a job lands in the DLQ.

## Why Exponential (Not Fixed)?

**Fixed retry** (e.g., every 2s) hammers the provider during outages:
```
failure → 2s → failure → 2s → failure → 2s → ...
```

**Exponential backoff** gives the provider progressively more recovery time:
```
failure → 2s → failure → 4s → failure → 8s → ...
```

This is especially important for providers like Twilio that enforce rate limits.

## Retryable vs Non-Retryable Errors

| Error Type | Examples | Behavior |
|-----------|----------|----------|
| **Retryable** | Network timeout, rate limit, 5xx | BullMQ retries with backoff |
| **Non-retryable** | Invalid phone, auth failure, 4xx | Immediately to DLQ via `UnrecoverableError` |

### Provider Error Codes

#### SMS (Twilio)
- `21211` — Invalid 'To' phone → **non-retryable**
- `21614` — Not a valid mobile → **non-retryable**
- `21608` — Unverified number → **non-retryable**
- `21610` — Blocked by opt-out → **non-retryable**
- All others → **retryable**

#### Email (SMTP)
- `535` — Auth failure → **non-retryable**
- `550` — Recipient not found → **non-retryable**
- `552` — Message too large → **non-retryable**
- `553` — Invalid address → **non-retryable**
- `554` — Policy rejection → **non-retryable**
- Connection timeouts, resets → **retryable**

#### Push (FCM)
- `messaging/registration-token-not-registered` → **non-retryable**
- `messaging/invalid-registration-token` → **non-retryable**
- `messaging/invalid-argument` → **non-retryable**
- All others → **retryable**

#### WhatsApp (Twilio)
- Same as SMS codes plus `63016` (template not approved) → **non-retryable**

## Rate Limiting

Each channel worker has a provider-specific rate limit:

| Channel | Limit | Rationale |
|---------|-------|-----------|
| SMS | 10/sec | Twilio trial/standard limits |
| Email | 20/sec | SMTP provider throughput |
| Push | 50/sec | FCM batch limit |
| WhatsApp | 10/sec | Twilio WhatsApp limits |
| In-App | 100/sec | Internal DB — higher throughput |

## Dead-Letter Queue (DLQ)

Jobs enter the DLQ when:
1. All 5 retry attempts are exhausted (retries-exhausted event)
2. A `NonRetryableProviderError` is thrown (immediate via `UnrecoverableError`)

### DLQ Lifecycle

```
pending → replayed → resolved
                  → failed_again (future hardening)
```

Current implementation supports: `pending` → `resolved`.

### Replay

```
POST /api/v1/admin/dlq/:id/retry
```

Re-enqueues the original job payload into the channel queue with fresh retry attempts.

## Future Improvements

- **Jitter**: Add random jitter to prevent thundering herd after provider recovery
- **Circuit breaker**: Temporarily stop sending to a provider after N consecutive failures
- **DLQ alerting**: Send Slack/email alerts when DLQ entries exceed a threshold
- **DLQ failed_again status**: Track jobs that fail even after replay
