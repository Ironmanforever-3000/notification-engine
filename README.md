# Notification Engine

An event-driven notification backend for financial applications. Receives financial events (e.g., ORDER_EXECUTED, MARGIN_CALL) and routes notifications through SMS, Email, Push, WhatsApp, and In-App channels with compliance enforcement (DND, quiet hours, frequency caps).

## Architecture

```
Financial Systems (Trading, Payments, KYC, SIP)
       │
       │ Events
       ▼
Message Broker (Kafka — Phase 2)
       │
       ▼
Notification Engine
  ├── Event Processor    ── validates & routes events
  ├── Preference Manager ── user channel preferences
  ├── Rule Engine        ── DND, quiet hours, frequency caps
  ├── Template Engine    ── localized message rendering
  └── Channel Router     ── SMS, Email, Push, WhatsApp, In-App
       │
       ▼
Delivery Status → PostgreSQL → Analytics Pipeline
```

## Quick Start

### Prerequisites

- Node.js >= 20
- Docker & Docker Compose
- Git

### Setup

```bash
# Clone & install
git clone <repo-url>
cd notification-engine
npm install

# Start infrastructure
docker compose up -d

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with tsx (hot reload) |
| `npm run build` | Compile TypeScript to dist/ |
| `npm start` | Run compiled JS |
| `npm test` | Run unit tests |
| `npm run test:coverage` | Tests with coverage report |
| `npm run typecheck` | Type-check without emitting |
| `npm run docker:up` | Start PostgreSQL + Redis |
| `npm run docker:down` | Stop Docker services |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:generate` | Regenerate Prisma client |

## Event Types

The engine supports **28 event types** across 5 priority tiers:

| Tier | Count | Bypass DND | Bypass Quiet Hours | Bypass Frequency Cap |
|------|-------|-----------|-------------------|---------------------|
| CRITICAL | 5 | ✅ | ✅ | ✅ |
| HIGH | 6 | ❌ | ❌ | ❌ |
| NORMAL | 9 | ❌ | ❌ | ❌ |
| LOW | 4 | ❌ | ❌ | ❌ |
| REGULATORY | 4 | ❌ | ❌ | ❌ |

See `config/event-types.json` for the full event taxonomy.

## Project Structure

```
notification-engine/
├── config/                 # Event type configuration
│   └── event-types.json
├── prisma/                 # Database schema & migrations
│   └── schema.prisma
├── src/
│   ├── config/             # Database, environment, event registry
│   ├── events/             # Types, processor, validator
│   ├── notifications/      # Notification service, status
│   ├── channels/           # SMS, Email, Push, WhatsApp, In-App
│   ├── preferences/        # User preference management
│   ├── compliance/         # DND, quiet hours, frequency caps
│   ├── templates/          # Template rendering
│   ├── analytics/          # Delivery tracking
│   ├── infrastructure/     # Logging
│   └── index.ts            # Entry point
├── tests/                  # Unit & integration tests
├── docker-compose.yml      # PostgreSQL + Redis
└── package.json
```

## License

ISC