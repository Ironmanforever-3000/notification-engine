import { Queue } from "bullmq";
import { env } from "../config/env";

export interface DispatchWhatsappJob {
  eventId: string;
  userId: string;
  channel: "whatsapp";
}

export const dispatchWhatsappQueue = new Queue<DispatchWhatsappJob>("dispatch-whatsapp", {
  connection: {
    host: env.redisHost,
    port: env.redisPort,
  },
});