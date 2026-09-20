import { getEventTypeConfig } from "../config/event-registry";
import { dispatchSmsQueue } from "../queues/dispatchSms.queue";
import { dispatchEmailQueue } from "../queues/dispatchEmail.queue";
import { dispatchPushQueue } from "../queues/dispatchPush.queue";
import { dispatchWhatsappQueue } from "../queues/dispatchWhatsapp.queue";

export interface RoutingInput {
  eventId: string;
  eventType: string;
  userId: string;
}

export async function routeEvent(input: RoutingInput) {
  const config = getEventTypeConfig(input.eventType);

  if (!config) {
    throw new Error(`No event configuration found for ${input.eventType}`);
  }

  const channels = config.default_channels;

  for (const channel of channels) {
    switch (channel.toLowerCase()) {
      case "sms":
        await dispatchSmsQueue.add("dispatch-sms", {
          eventId: input.eventId,
          userId: input.userId,
          channel: "sms",
        });
        break;

      case "email":
        await dispatchEmailQueue.add("dispatch-email", {
          eventId: input.eventId,
          userId: input.userId,
          channel: "email",
        });
        break;

      case "push":
        await dispatchPushQueue.add("dispatch-push", {
          eventId: input.eventId,
          userId: input.userId,
          channel: "push"
        });
        break;

      case "whatsapp":
        await dispatchWhatsappQueue.add("dispatch-whatsapp", {
          eventId: input.eventId,
          userId: input.userId,
          channel: "whatsapp"
        });
        break;

      case "in_app":
        console.log(`In-app channel selected for event ${input.eventId}`);
        break;

      default:
        console.warn(`Unsupported channel configured: ${channel}`);
    }
  }

  return {
    eventId: input.eventId,
    channels,
  };
}