import { createDispatchWorker } from "./dispatchWorker.factory";
import { sendEmail } from "../services/channels/email.service";

const worker = createDispatchWorker({
  queueName: "dispatch-email",
  channel: "email",
  getDestination: (user) => {
    return user.email;
  },
  send: async (destination, message, subject) => {
    return sendEmail(destination, subject ?? "Notification", message);
  },
});

worker.on("completed", (job) => {
  console.log(`Email job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  console.error(`Email job ${job?.id} failed:`, error.message);
});

console.log("Email dispatch worker started");