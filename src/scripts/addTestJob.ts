import { routeEventQueue } from "../queues/routeEvent.queue";

async function addTestJob() {
  await routeEventQueue.add("route-event", {
    eventId: "test-id-12345",
  });
  console.log("Test job added.");
  process.exit(0);
}
addTestJob();