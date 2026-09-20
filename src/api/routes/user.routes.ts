import { Router } from "express";
import { getInAppNotifications } from "../controllers/inApp.controller";

const router = Router();
router.get("/users/:id/notifications", getInAppNotifications);

export default router;