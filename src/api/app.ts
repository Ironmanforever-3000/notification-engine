import express from "express";
import eventRoutes from "./routes/event.routes";

const app = express();
app.use(express.json());

app.get("/api/v1/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "notification-engine"
  });
});

app.use("/api/v1", eventRoutes);

export default app;