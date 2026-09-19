import express from "express";
import eventRoutes from "./routes/event.routes";
import { requestIdMiddleware } from "./middleware/request-id.middleware";
import { errorMiddleware } from "./middleware/error.middleware";

const app = express();

app.use(express.json());
app.use(requestIdMiddleware);

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/v1", eventRoutes);

app.use(errorMiddleware);

export default app;