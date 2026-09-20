import { firebaseMessaging } from "../../config/firebase";

export interface PushResult {
  success: boolean;
  providerMessageId?: string;
  providerResponse?: unknown;
}

export interface PushError {
  retryable: boolean;
  reason: string;
  providerCode?: string;
}

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
    const nonRetryableCodes = new Set([
      "messaging/registration-token-not-registered",
      "messaging/invalid-registration-token",
    ]);

    throw {
      retryable: !nonRetryableCodes.has(code),
      reason: error?.message ?? "FCM provider error",
      providerCode: code,
    } satisfies PushError;
  }
}