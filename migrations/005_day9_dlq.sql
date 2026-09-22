-- Day 9: Dead-Letter Queue table
-- Stores jobs that exhausted all retry attempts or hit non-retryable errors.
-- job_data JSONB preserves the original payload for replay.

CREATE TABLE IF NOT EXISTS dead_letter_queue (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    queue_name      VARCHAR(100)  NOT NULL,
    job_id          VARCHAR(255)  NOT NULL,
    job_name        VARCHAR(255)  NOT NULL,
    event_id        UUID          REFERENCES notification_events(id) ON DELETE SET NULL,
    user_id         UUID          REFERENCES users(id) ON DELETE SET NULL,
    channel         VARCHAR(50),
    job_data        JSONB         NOT NULL,
    failure_reason  TEXT          NOT NULL,
    failure_stack   TEXT,
    attempts_made   INT           NOT NULL DEFAULT 0,
    max_attempts    INT,
    status          VARCHAR(30)   NOT NULL DEFAULT 'pending',
    resolved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Prevent duplicate DLQ entries for the same job
CREATE UNIQUE INDEX IF NOT EXISTS uq_dead_letter_queue_job
    ON dead_letter_queue(queue_name, job_id);

-- Fast lookup for admin dashboard: pending items first
CREATE INDEX IF NOT EXISTS idx_dlq_status_created
    ON dead_letter_queue(status, created_at DESC);

-- Correlate DLQ entries back to the originating event
CREATE INDEX IF NOT EXISTS idx_dlq_event_id
    ON dead_letter_queue(event_id);
