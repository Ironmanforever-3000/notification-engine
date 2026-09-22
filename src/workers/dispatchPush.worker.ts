import { createDispatchWorker } from "./dispatchWorker.factory";
import { sendPush } from "../services/channels/push.service";

const worker = createDispatchWorker({
  queueName: "dispatch-push",
  channel: "push",
  rateLimitPerSecond: 50, // FCM rate limit protection
  getDestination: (user) => {
    return user.fcm_token;
  },
  send: async (destination, message, subject) => {
    return sendPush(destination, subject ?? "Notification", message);
  },
});

worker.on("completed", (job) => {
  console.log(`Push job ${job.id} completed`);
});
worker.on("failed", (job, error) => {
  console.error(`Push job ${job?.id} failed:`, error.message);
});

console.log("Push dispatch worker started");