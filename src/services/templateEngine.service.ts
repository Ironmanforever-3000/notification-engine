import Handlebars from "handlebars";
import { query } from "../db/client";

// ── Handlebars helpers ───────────────────────────────────────────────────────
Handlebars.registerHelper("currency", (value: unknown) => {
  return Number(value).toLocaleString("en-IN");
});

// ── Types ────────────────────────────────────────────────────────────────────
export interface RenderedTemplate {
  subject?: string;
  body: string;
}

// ── Internal template lookup ─────────────────────────────────────────────────
// NOTE: notification_templates uses "locale" column (not "language") per actual schema
async function findTemplate(eventType: string, channel: string, locale: string) {
  const rows = await query<{ subject: string | null; body: string; locale: string }>(
    `SELECT subject, body, locale FROM notification_templates
     WHERE event_type = $1 AND channel = $2 AND locale = $3 AND active = true
     ORDER BY version DESC LIMIT 1`,
    [eventType, channel, locale]
  );
  return rows[0] ?? null;
}

/**
 * Renders a personalised message using Handlebars + DB templates.
 * Falls back to English if the requested locale template is missing.
 * Throws only if no template exists at all (not during rendering).
 */
export async function render(
  eventType: string,
  channel: string,
  locale: string,              // e.g. "hi" or "en"
  data: Record<string, unknown>
): Promise<RenderedTemplate> {

  // 1. Try requested locale
  let template = await findTemplate(eventType, channel, locale);

  // 2. English fallback
  if (!template && locale !== "en") {
    template = await findTemplate(eventType, channel, "en");
  }

  // 3. No template at all — generic fallback (never break delivery)
  if (!template) {
    return {
      subject: `Financial Alert: ${eventType}`,
      body: `Notification: ${eventType}`,
    };
  }

  // 4. Compile and render with Handlebars
  const bodyFn = Handlebars.compile(template.body);
  const body = bodyFn(data);

  let subject: string | undefined;
  if (template.subject) {
    const subjectFn = Handlebars.compile(template.subject);
    subject = subjectFn(data);
  }

  return { subject, body };
}
