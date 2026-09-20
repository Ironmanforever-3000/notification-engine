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

export async function sendEmail(to: string, subject: string, body: string): Promise<EmailResult> {
  // Placeholder mock for email provider (e.g. SendGrid, AWS SES)
  // To avoid blocking testing, it simulates a successful outbound queue
  return {
    success: true,
    providerMessageId: `mock_email_${Date.now()}`,
    providerResponse: { status: "accepted_by_provider", to, subject },
  };
}
