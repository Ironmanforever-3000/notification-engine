import { Request, Response, NextFunction } from "express";
import { createEventSchema } from "../../types/event.types";
import { ingestEvent } from "../../services/event.service";
import { AppError } from "../middleware/error.middleware";

export async function createEvent(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = createEventSchema.safeParse(req.body);

    if (!result.success) {
      throw new AppError(
        400,
        "INVALID_REQUEST",
        result.error.issues.map(issue => issue.message).join(", ")
      );
    }

    const event = await ingestEvent(result.data);

    return res.status(202).json({
      eventId: event.id,
      status: "queued"
    });

  } catch (error) {
    next(error);
  }
}