import { getUserById } from "../db/queries/user.queries";
import { insertEvent } from "../db/queries/event.queries";
import { routeEventQueue } from "../queues/routeEvent.queue";
import { CreateEventInput } from "../types/event.types";
import { isValidEventType, getEventTypeConfig } from "../config/event-registry";
import { AppError } from "../api/middleware/error.middleware";

export async function ingestEvent(input: CreateEventInput) {
  if (!isValidEventType(input.event_type)) {
    throw new AppError(
      400,
      "INVALID_EVENT_TYPE",
      `Unsupported event type: ${input.event_type}`
    );
  }

  const user = await getUserById(input.user_id);
  if (!user) {
    throw new AppError(
      400,
      "USER_NOT_FOUND",
      "The specified user does not exist"
    );
  }

  const eventConfig = getEventTypeConfig(input.event_type);

  const savedEvent = await insertEvent({
    event_type: input.event_type,
    user_id: input.user_id,
    payload: input.payload,
    priority: input.priority ?? eventConfig?.tier ?? "NORMAL",
    correlation_id: input.correlation_id
  });

  await routeEventQueue.add(
    "route-financial-event",
    { eventId: savedEvent.id }
  );

  return savedEvent;
}