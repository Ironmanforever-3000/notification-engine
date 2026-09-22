import { Twilio } from "twilio";
import { env } from "../../config/env";
import {
  RetryableProviderError,
  NonRetryableProviderError,
} from "../../types/delivery.types";

export interface WhatsappResult {
  success: boolean;
  providerMessageId?: string;
  providerResponse?: unknown;
}

// Non-retryable Twilio WhatsApp error codes
const NON_RETRYABLE_CODES = new Set([
  21211, // Invalid 'To' phone number
  21614, // Not a valid mobile number
  63016, // Template not approved
]);

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
    const providerCode = error?.code;

    if (NON_RETRYABLE_CODES.has(providerCode)) {
      throw new NonRetryableProviderError(
        error.message ?? "WhatsApp permanent failure",
        providerCode
      );
    }

    throw new RetryableProviderError(
      error.message ?? "WhatsApp temporary failure",
      providerCode
    );
  }
}