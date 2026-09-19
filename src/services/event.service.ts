import { getUserById } from "../db/queries/user.queries";
import { insertEvent } from "../db/queries/event.queries";
import { routeEventQueue } from "../queues/routeEvent.queue";
import { FinancialEvent } from "../types/event.types";

export async function ingestEvent(
  event: FinancialEvent
) {
  const user = await getUserById(event.user_id);
  if (!user) {
    throw new Error("User not found");
  }

  const savedEvent = await insertEvent(event);

  await routeEventQueue.add(
    "route-financial-event",
    {
      eventId: savedEvent.id,
      eventType: savedEvent.event_type,
      userId: savedEvent.user_id,
      payload: savedEvent.payload,
    }
  );

  return savedEvent;
}