import nodemailer from "nodemailer";
import { env } from "../../config/env";

export interface EmailResult {
  success: boolean;
  providerMessageId?: string;
  providerResponse?: unknown;
}

export interface EmailError {
  retryable: boolean;
  reason: string;
  providerCode?: string | number;
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
    const normalizedError: EmailError = {
      retryable: true,
      reason: error?.message ?? "Email provider error",
      providerCode: error?.code,
    };
    throw normalizedError;
  }
}