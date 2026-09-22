import express from "express";
import eventRoutes from "./routes/event.routes";
import userRoutes from "./routes/user.routes";
import adminDlqRoutes from "./routes/adminDlq.routes";
import analyticsRoutes from "./routes/analytics.routes";
import { requestIdMiddleware } from "./middleware/request-id.middleware";
import { errorMiddleware } from "./middleware/error.middleware";

const app = express();

app.use(express.json());
app.use(requestIdMiddleware);

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/v1", eventRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", adminDlqRoutes);
app.use("/api/v1", analyticsRoutes);

app.use(errorMiddleware);

export default app;