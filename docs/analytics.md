# Analytics Architecture

## Design Decision: Event-Driven Aggregation

This project uses **event-driven aggregation** (Option A) rather than cron-based scanning:

```
Notification sent → createDelivery() → incrementAnalytics() → incrementLiveCounter()
```

### Why?

1. The project is specifically an *event-driven* notification engine — analytics should follow the same pattern
2. Near-real-time metrics without waiting for a cron cycle
3. Demonstrates end-to-end event-driven architecture for portfolio value

### Tradeoff

Additional PostgreSQL write per notification (UPSERT into `analytics_hourly`).

## Two-Layer Architecture

### PostgreSQL: Historical Analytics

```sql
analytics_hourly (
    hour_bucket    TIMESTAMPTZ,
    event_type     TEXT,
    channel        TEXT,
    sent_count     INT,
    delivered_count INT,
    failed_count   INT,
    suppressed_count INT
)
```

- **Durable** — survives Redis restart
- **Hourly granularity** — efficient for dashboard queries
- **UPSERT** — single-row atomic increment per (hour, event_type, channel)

### Redis: Live Counters

```
Key:    analytics:live:{channel}:{minuteBucket}
TTL:    120 seconds
```

- **Real-time** — sub-second latency
- **Ephemeral** — auto-expires after 2 minutes
- **Last ~60 seconds** — current + previous minute bucket

## Avoiding Double-Counting Retries

Metrics track **final outcomes**, not retry attempts:

| Metric | When Incremented |
|--------|-----------------|
| `sent` | Provider returns success |
| `delivered` | Delivery webhook confirms (future) |
| `failed` | Job reaches DLQ (all retries exhausted) |
| `suppressed` | `canSend()` blocks the notification |

Intermediate retry failures do NOT increment `failed_count`.

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/analytics/summary?from=...&to=...` | By channel |
| `GET /api/v1/analytics/by-event-type?from=...&to=...` | By event type |
| `GET /api/v1/analytics/dlq-rate?from=...&to=...` | DLQ metrics |
| `GET /api/v1/analytics/live` | Redis live counters |

## Grafana Dashboard Panels

### Panel 1 — Notifications Sent (Time Series)
```sql
SELECT $__timeGroupAlias(hour_bucket, '1h'),
       SUM(sent_count) AS sent
FROM analytics_hourly
WHERE $__timeFilter(hour_bucket)
GROUP BY 1 ORDER BY 1;
```

### Panel 2 — By Channel (Bar Chart)
```sql
SELECT channel,
       SUM(sent_count) AS sent,
       SUM(delivered_count) AS delivered,
       SUM(failed_count) AS failed
FROM analytics_hourly
WHERE $__timeFilter(hour_bucket)
GROUP BY channel ORDER BY channel;
```

### Panel 3 — DLQ Over Time (Time Series)
```sql
SELECT $__timeGroupAlias(created_at, '1h'),
       COUNT(*) AS dlq_count
FROM dead_letter_queue
WHERE $__timeFilter(created_at)
GROUP BY 1 ORDER BY 1;
```

### Panel 4 — Suppressions (Time Series)
```sql
SELECT $__timeGroupAlias(hour_bucket, '1h'),
       SUM(suppressed_count) AS suppressed
FROM analytics_hourly
WHERE $__timeFilter(hour_bucket)
GROUP BY 1 ORDER BY 1;
```

## Grafana Setup

1. Start Grafana: `docker compose up -d`
2. Open: http://localhost:3001 (default: admin/admin)
3. Add PostgreSQL datasource:
   - Host: `postgres:5432` (Docker internal)
   - Database: `notifications`
   - User: `notifications`
   - Password: `devpass`
   - SSL: Disable
4. Create dashboard with the SQL queries above
