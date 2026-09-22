-- Day 10: Hourly analytics aggregation table
-- Uses composite PK (hour_bucket, event_type, channel) for UPSERT efficiency.
-- Workers increment counters in real-time via INSERT ... ON CONFLICT DO UPDATE.

CREATE TABLE IF NOT EXISTS analytics_hourly (
    hour_bucket       TIMESTAMPTZ NOT NULL,
    event_type        TEXT        NOT NULL,
    channel           TEXT        NOT NULL,
    sent_count        INT         NOT NULL DEFAULT 0,
    delivered_count   INT         NOT NULL DEFAULT 0,
    failed_count      INT         NOT NULL DEFAULT 0,
    suppressed_count  INT         NOT NULL DEFAULT 0,

    PRIMARY KEY (hour_bucket, event_type, channel)
);

-- Fast time-range scans for Grafana panels
CREATE INDEX IF NOT EXISTS idx_analytics_hourly_bucket
    ON analytics_hourly(hour_bucket DESC);

-- Per-channel dashboard filtering
CREATE INDEX IF NOT EXISTS idx_analytics_hourly_channel
    ON analytics_hourly(channel, hour_bucket DESC);

-- Per-event-type dashboard filtering
CREATE INDEX IF NOT EXISTS idx_analytics_hourly_event_type
    ON analytics_hourly(event_type, hour_bucket DESC);
