import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from "express";
import { logger } from "../../utils/logger";

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = req.header("x-request-id") ?? randomUUID();
  res.setHeader("x-request-id", requestId);
  (req as Request & { requestId: string }).requestId = requestId;

  logger.info("Incoming request", {
    requestId,
    method: req.method,
    path: req.originalUrl
  });

  next();
}