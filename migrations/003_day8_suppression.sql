-- Day 8: Suppression tracking table
CREATE TABLE IF NOT EXISTS suppressed_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES notification_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    reason VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_suppressed_notifications_user_created ON suppressed_notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_suppressed_notifications_reason ON suppressed_notifications(reason);

-- Add DND registry (if not already in schema)
CREATE TABLE IF NOT EXISTS dnd_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_dnd_registered BOOLEAN NOT NULL DEFAULT FALSE,
    allowed_categories TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT dnd_registry_user_id_key UNIQUE (user_id)
);