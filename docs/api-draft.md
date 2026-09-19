# Notification Engine API Draft

Base URL: `/api/v1`

## Events

### POST /events
Accept a financial event for asynchronous notification processing.

Request:
```json
{
  "event_type": "ORDER_EXECUTED",
  "user_id": "UUID",
  "payload": {},
  "correlation_id": "ORDER-123"
}
```

Response:
`HTTP 202 Accepted`

## User Preferences

### GET /users/:id/preferences
Returns notification preferences.

### PATCH /users/:id/preferences
Updates notification preferences.

## Notifications

### GET /users/:id/notifications
Returns notification history.

### GET /notifications/:id
Returns notification status.

### GET /notifications/:id/deliveries
Returns channel delivery status.

### POST /notifications/:id/retry
Requests retry of a failed notification.

## Templates

### GET /templates
List templates.

### POST /templates
Create template.

### PATCH /templates/:id
Update template.

### DELETE /templates/:id
Delete template.

## Health

### GET /health
Returns service health.