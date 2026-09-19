import { z } from "zod";

export const createEventSchema = z.object({
  event_type: z.string().min(1),
  user_id: z.string().uuid(),
  payload: z.record(z.string(), z.unknown()),
  priority: z.enum(["CRITICAL", "HIGH", "NORMAL", "LOW", "REGULATORY"]).optional(),
  correlation_id: z.string().max(100).optional()
});

export type CreateEventInput = z.infer<typeof createEventSchema>;