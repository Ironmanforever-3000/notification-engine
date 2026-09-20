import { routeEventQueue } from "./src/queues/routeEvent.queue";
async function addDuplicate() {
  await routeEventQueue.add("route-event", { eventId: "b8539056-a013-409d-8327-2bcc61b2e9dd" });
  process.exit(0);
}
addDuplicate();