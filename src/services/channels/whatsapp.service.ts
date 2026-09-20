import { Twilio } from "twilio";
import { env } from "../../config/env";

export interface WhatsappResult {
  success: boolean;
  providerMessageId?: string;
  providerResponse?: unknown;
}

export interface WhatsappError {
  retryable: boolean;
  reason: string;
  providerCode?: string | number;
}

let client: Twilio | null = null;
if (env.twilioAccountSid && env.twilioAccountSid.startsWith("AC")) {
  client = new Twilio(env.twilioAccountSid, env.twilioAuthToken);
}

export async function sendWhatsapp(
  to: string,
  body: string
): Promise<WhatsappResult> {
  // Mock fallback for testing if Twilio isn't fully configured
  if (!client) {
    return {
      success: true,
      providerMessageId: `mock_wa_${Date.now()}`,
      providerResponse: { status: "queued", sid: `mock_wa_${Date.now()}` }
    };
  }

  try {
    const message = await client.messages.create({
      from: env.twilioWhatsappFrom,
      to: `whatsapp:${to.replace(/^whatsapp:/, "")}`,
      body,
    });

    return {
      success: true,
      providerMessageId: message.sid,
      providerResponse: { sid: message.sid, status: message.status },
    };
  } catch (error: any) {
    throw {
      retryable: true,
      reason: error?.message ?? "WhatsApp provider error",
      providerCode: error?.code,
    } satisfies WhatsappError;
  }
}