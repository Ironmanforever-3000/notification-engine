import nodemailer from "nodemailer";
import { env } from "../../config/env";
import {
  RetryableProviderError,
  NonRetryableProviderError,
} from "../../types/delivery.types";

export interface EmailResult {
  success: boolean;
  providerMessageId?: string;
  providerResponse?: unknown;
}

/**
 * Determines if an SMTP error is permanent (no point retrying).
 * - Auth failures (535, EAUTH)
 * - Invalid recipient (550, 553)
 * - Message rejected (552 size, 554 policy)
 */
function isPermanentEmailError(error: any): boolean {
  const code = error?.responseCode ?? error?.code;
  const permanentCodes = new Set([535, 550, 552, 553, 554]);
  if (typeof code === "number" && permanentCodes.has(code)) return true;
  if (code === "EAUTH" || code === "EENVELOPE") return true;
  return false;
}

// Lazy-load so it doesn't crash on boot if credentials are mock/missing
let transporter: any | null = null;

export async function sendEmail(
  to: string,
  subject: string,
  body: string
): Promise<EmailResult> {
  // If local testing without valid SMTP user, mock success
  if (!env.smtpUser || env.smtpUser === "mock_user") {
    return {
      success: true,
      providerMessageId: `mock_email_${Date.now()}`,
      providerResponse: {
        messageId: `mock_email_${Date.now()}`,
        response: "250 2.0.0 Ok: queued",
      },
    };
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPassword,
      },
    });
  }

  try {
    const result = await transporter.sendMail({
      from: env.emailFrom,
      to,
      subject,
      text: body,
    });

    return {
      success: true,
      providerMessageId: result.messageId,
      providerResponse: {
        messageId: result.messageId,
        response: result.response,
      },
    };
  } catch (error: any) {
    if (isPermanentEmailError(error)) {
      throw new NonRetryableProviderError(
        error.message ?? "Permanent email failure",
        error?.responseCode ?? error?.code
      );
    }

    throw new RetryableProviderError(
      error.message ?? "Temporary email failure",
      error?.responseCode ?? error?.code
    );
  }
}