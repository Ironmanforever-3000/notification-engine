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

const client = twilio(env.twilioAccountSid, env.twilioAuthToken);

export async function sendSms(to: string, body: string): Promise<SmsResult> {
  // Mock support if local testing without real credentials
  if (env.twilioAccountSid === "mock_sid") {
    return {
      success: true,
      providerMessageId: `mock_${Date.now()}`,
      providerResponse: { sid: `mock_${Date.now()}`, status: "queued" },
    };
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
