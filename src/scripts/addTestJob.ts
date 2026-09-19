import { routeEventQueue } from "../queues/routeEvent.queue";

async function main() {
  const job = await routeEventQueue.add(
    "test-job",
    {
      eventId: "test-event-1",
      eventType: "ORDER_EXECUTED",
      userId: "test-user-1",
      payload: {
        message: "Hello from test job"
      }
    }
  );

  console.log("Created job:", job.id);
  await routeEventQueue.close();
  process.exit(0);
}

main().catch(console.error);