import { createDispatchWorker } from "./dispatchWorker.factory";
import { sendWhatsapp } from "../services/channels/whatsapp.service";

const worker = createDispatchWorker({
  queueName: "dispatch-whatsapp",
  channel: "whatsapp",
  getDestination: (user) => {
    return user.phone;
  },
  send: async (destination, message) => {
    return sendWhatsapp(destination, message);
  },
});

worker.on("completed", (job) => {
  console.log(`WhatsApp job ${job.id} completed`);
});
worker.on("failed", (job, error) => {
  console.error(`WhatsApp job ${job?.id} failed:`, error.message);
});

console.log("WhatsApp dispatch worker started");