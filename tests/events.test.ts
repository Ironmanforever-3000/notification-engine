import request from "supertest";
import app from "../src/api/app";
import { pool } from "../src/db/client";

describe("POST /api/v1/events", () => {
  afterAll(async () => {
    await pool.end();
  });

  test("accepts a valid event", async () => {
    const users = await pool.query("SELECT id FROM users LIMIT 1");
    const userId = users.rows[0].id;

    const response = await request(app)
      .post("/api/v1/events")
      .send({
        event_type: "ORDER_EXECUTED",
        user_id: userId,
        payload: {
          order_id: "TEST-001",
          symbol: "RELIANCE",
          quantity: 10,
          price: 3025
        },
        priority: "HIGH"
      });

    expect(response.status).toBe(202);
    expect(response.body.status).toBe("queued");
    expect(response.body.eventId).toBeDefined();

    const result = await pool.query(
      "SELECT * FROM notification_events WHERE id = $1",
      [response.body.eventId]
    );

    expect(result.rows.length).toBe(1);
  });

  test("rejects invalid event type", async () => {
    const users = await pool.query("SELECT id FROM users LIMIT 1");
    const userId = users.rows[0].id;

    const response = await request(app)
      .post("/api/v1/events")
      .send({
        event_type: "INVALID_EVENT",
        user_id: userId,
        payload: {}
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_EVENT_TYPE");
  });
});