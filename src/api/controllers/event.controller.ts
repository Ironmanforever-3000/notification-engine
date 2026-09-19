import { Request, Response } from "express";
import { ingestEvent } from "../../services/event.service";

export async function createEvent(
  req: Request,
  res: Response
) {
  try {
    const {
      event_type,
      user_id,
      payload,
      priority,
      correlation_id
    } = req.body;

    if (!event_type || !user_id || !payload) {
      return res.status(400).json({
        error: "event_type, user_id and payload are required"
      });
    }

    const event = await ingestEvent({
      event_type,
      user_id,
      payload,
      priority,
      correlation_id
    });

    return res.status(202).json({
      message: "Event accepted for processing",
      event
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to ingest event"
    });
  }
}