import { createDispatchWorker } from "./dispatchWorker.factory";
import { sendSms } from "../services/channels/sms.service";

const worker = createDispatchWorker({
  queueName: "dispatch-sms",
  channel: "sms",
  getDestination: (user) => {
    return user.phone;
  },
  send: async (destination, message) => {
    return sendSms(destination, message);
  },
});

worker.on("completed", (job) => {
  console.log(`SMS job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
  console.error(`SMS job ${job?.id} failed:`, error.message);
});

console.log("SMS dispatch worker started");