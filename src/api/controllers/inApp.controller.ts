import { Request, Response, NextFunction } from "express";
import { getUserInAppNotifications } from "../../db/queries/inApp.queries";

export async function getInAppNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.params.id as string;
    const notifications = await getUserInAppNotifications(userId);
    res.status(200).json({ notifications });
  } catch (error) {
    next(error);
  }
}