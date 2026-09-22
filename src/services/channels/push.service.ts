import { firebaseMessaging } from "../../config/firebase";
import {
  RetryableProviderError,
  NonRetryableProviderError,
} from "../../types/delivery.types";

export interface PushResult {
  success: boolean;
  providerMessageId?: string;
  providerResponse?: unknown;
}

// FCM error codes that indicate the token is permanently invalid
const NON_RETRYABLE_FCM_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
  "messaging/invalid-argument",
]);

export async function sendPush(
  token: string,
  title: string,
  body: string
): Promise<PushResult> {
  // Mock fallback for testing without real FCM credentials
  if (!firebaseMessaging) {
    return {
      success: true,
      providerMessageId: `mock_fcm_${Date.now()}`,
      providerResponse: { messageId: `mock_fcm_${Date.now()}` },
    };
  }

  try {
    const messageId = await firebaseMessaging.send({
      token,
      notification: { title, body },
      data: { source: "notification-engine" },
    });

    return {
      success: true,
      providerMessageId: messageId,
      providerResponse: { messageId },
    };
  } catch (error: any) {
    const code = error?.code ?? "unknown";

    if (NON_RETRYABLE_FCM_CODES.has(code)) {
      throw new NonRetryableProviderError(
        error.message ?? "FCM permanent failure",
        code
      );
    }

    throw new RetryableProviderError(
      error.message ?? "FCM temporary failure",
      code
    );
  }
}