import twilio from "twilio";
import { env } from "../../config/env";

export interface SmsResult {
  success: boolean;
  providerMessageId?: string;
  providerResponse?: unknown;
}

export interface SmsError {
  retryable: boolean;
  reason: string;
  providerCode?: string | number;
}

// Lazy-load the client so we don't crash on boot with mock credentials
let client: twilio.Twilio | null = null;

export async function sendSms(to: string, body: string): Promise<SmsResult> {
  // If we don't have real credentials (must start with "AC"), mock success
  if (!env.twilioAccountSid || !env.twilioAccountSid.startsWith("AC")) {
    return {
      success: true,
      providerMessageId: `mock_${Date.now()}`,
      providerResponse: { sid: `mock_${Date.now()}`, status: "queued" },
    };
  }

  // Initialize the client only if we have a valid AC... SID
  if (!client) {
    client = twilio(env.twilioAccountSid, env.twilioAuthToken);
  }

  try {
    const message = await client.messages.create({
      body,
      from: env.twilioPhoneNumber,
      to,
    });

    return {
      success: true,
      providerMessageId: message.sid,
      providerResponse: {
        sid: message.sid,
        status: message.status,
      },
    };
  } catch (error: any) {
    const code = error?.code;
    const nonRetryableCodes = new Set([21211, 21614]);
    const retryable = !nonRetryableCodes.has(code);

    const normalizedError: SmsError = {
      retryable,
      reason: error?.message ?? "Unknown Twilio error",
      providerCode: code,
    };

    throw normalizedError;
  }
}