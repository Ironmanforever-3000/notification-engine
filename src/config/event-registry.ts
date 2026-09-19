import eventTypes from "../../config/event-types.json";

export interface EventTypeConfig {
  event_type: string;
  tier: string;
  default_channels: string[];
  description: string;
}

const registry = new Map<string, EventTypeConfig>(
  eventTypes.map((event) => [event.event_type, event as EventTypeConfig])
);

export function isValidEventType(eventType: string): boolean {
  return registry.has(eventType);
}

export function getEventTypeConfig(eventType: string): EventTypeConfig | undefined {
  return registry.get(eventType);
}