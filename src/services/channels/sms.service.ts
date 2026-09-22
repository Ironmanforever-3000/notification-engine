import twilio from "twilio";
import { env } from "../../config/env";
import {
  RetryableProviderError,
  NonRetryableProviderError,
} from "../../types/delivery.types";

export interface SmsResult {
  success: boolean;
  providerMessageId?: string;
  providerResponse?: unknown;
}

// Non-retryable Twilio error codes
const NON_RETRYABLE_CODES = new Set([
  21211, // Invalid 'To' phone number
  21614, // 'To' number is not a valid mobile number
  21608, // Unverified number (trial accounts)
  21610, // Message blocked by opt-out
]);

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
    const providerCode = error?.code;

    if (NON_RETRYABLE_CODES.has(providerCode)) {
      throw new NonRetryableProviderError(
        error.message ?? "Invalid phone number",
        providerCode
      );
    }

    throw new RetryableProviderError(
      error.message ?? "Twilio temporary failure",
      providerCode
    );
  }
}