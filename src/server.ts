import app from "./api/app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(`Notification Engine API running on http://localhost:${env.port}`);
});