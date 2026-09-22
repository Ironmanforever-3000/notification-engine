import { dispatchSmsQueue } from "../queues/dispatchSms.queue";
import { dispatchEmailQueue } from "../queues/dispatchEmail.queue";
import { dispatchPushQueue } from "../queues/dispatchPush.queue";
import { dispatchWhatsappQueue } from "../queues/dispatchWhatsapp.queue";
import { dispatchInAppQueue } from "../queues/dispatchInApp.queue";
import { Queue } from "bullmq";

/**
 * Maps a queue name string back to the actual BullMQ Queue instance.
 * Used by DLQ replay to re-enqueue jobs into the correct channel queue.
 */
export function getQueue(queueName: string): Queue {
  switch (queueName) {
    case "dispatch-sms":
      return dispatchSmsQueue;
    case "dispatch-email":
      return dispatchEmailQueue;
    case "dispatch-push":
      return dispatchPushQueue;
    case "dispatch-whatsapp":
      return dispatchWhatsappQueue;
    case "dispatch-in-app":
      return dispatchInAppQueue;
    default:
      throw new Error(`Unsupported DLQ queue: ${queueName}`);
  }
}
