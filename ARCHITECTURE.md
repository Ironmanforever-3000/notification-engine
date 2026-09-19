# Architecture

## Overview

The Notification Engine is a configuration-driven, event-processing backend
designed for financial applications. It decouples notification delivery from
business logic, ensuring that upstream services (Trading, Payments, KYC) are
never blocked by slow or failing notification providers.

## Core Principles

1. **Event-driven** — producers fire events; the engine processes them asynchronously
2. **Configuration-driven** — new event types can be added via JSON config, not code changes
3. **Compliance-first** — DND, quiet hours, frequency caps, and opt-in checks are enforced before delivery
4. **Multi-channel** — SMS, Email, Push, WhatsApp, In-App — each channel is a pluggable handler
5. **Idempotent** — duplicate events are detected and rejected via idempotency keys
6. **Auditable** — every notification attempt is logged for compliance and analytics

## Event Flow

```
Incoming Event
      |
      v
[Event Validator] -- Zod schema validation
      |
      v
[Event Registry]  -- Is this a known event type?
      |
      v
[Compliance Pipeline]
  ├── DND Checker        -- Is user in DND mode?
  ├── Quiet Hours        -- Is it within quiet hours?
  ├── Frequency Cap      -- Has user exceeded limits?
  └── Marketing Opt-in   -- Does LOW tier require consent?
      |
      v
[Preference Service]    -- Which channels does user want?
      |
      v
[Template Engine]       -- Render localized message
      |
      v
[Channel Router]        -- Route to SMS/Email/Push/WhatsApp/In-App
      |
      v
[Delivery Tracking]     -- Record status (SENT/DELIVERED/FAILED)
      |
      v
[Analytics Pipeline]    -- Metrics and reporting
```

## Priority Tiers

| Tier | Bypass DND | Bypass Quiet Hours | Bypass Freq Cap | Opt-in Required | Example |
|------|-----------|-------------------|----------------|----------------|---------|
| CRITICAL | Yes | Yes | Yes | No | MARGIN_CALL, ACCOUNT_FRAUD_ALERT |
| HIGH | No | No | No | No | ORDER_EXECUTED, TRANSACTION_ALERT |
| NORMAL | No | No | No | No | SIP_REMINDER, DIVIDEND_CREDITED |
| LOW | No | No | No | Yes | PROMOTIONAL_OFFER, SURVEY_REQUEST |
| REGULATORY | No | No | No | No | REGULATORY_NOTICE, KYC_DOCUMENT_REQUIRED |

## Database Design

### Core Tables

- **event_types** — Registry of all event type configurations
- **users** — User profiles with contact information and preferences
- **user_preferences** — Per-user, per-event, per-channel notification settings
- **notifications** — Individual notification records with status tracking
- **notification_logs** — Audit log for every delivery attempt
- **frequency_tracker** — Rate limiting counters per user/event/channel

### Key Design Decisions

- **Idempotency**: Each notification has a unique `idempotency_key` to prevent duplicate sends
- **JSONB payloads**: Event-specific data is stored as JSONB for schema flexibility
- **Status machine**: Notifications follow a strict state machine: PENDING -> QUEUED -> PROCESSING -> SENT -> DELIVERED
- **Audit trail**: Every status change is recorded in notification_logs

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Language | TypeScript | Type safety, catch errors at compile time |
| Runtime | Node.js | Event-loop based, good for I/O-heavy workloads |
| Database | PostgreSQL 16 | Primary data store, JSONB support |
| Cache | Redis 7 | Rate limiting, session storage (Phase 2) |
| ORM | Prisma | Type-safe database access, migrations |
| Validation | Zod | Runtime schema validation |
| Logging | Pino | Structured, high-performance logging |
| Testing | Jest + ts-jest | Unit and integration tests |
| Containers | Docker Compose | Local development infrastructure |

## Future Phases

- **Phase 2**: Message broker (Kafka/RabbitMQ), queue-based channel processing
- **Phase 3**: Template management, localization, retry logic with exponential backoff
- **Phase 4**: Prometheus metrics, Grafana dashboards, delivery analytics
- **Phase 5**: Real provider integrations (Twilio, SendGrid, Firebase, Meta)