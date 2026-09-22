// Mock the database client before importing the module under test
jest.mock("../src/db/client", () => ({
  query: jest.fn(),
}));

// Mock Redis for live analytics
jest.mock("ioredis", () => {
  return jest.fn().mockImplementation(() => ({
    incr: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(1),
    get: jest.fn().mockResolvedValue("5"),
  }));
});

import { query } from "../src/db/client";

const mockQuery = query as jest.MockedFunction<typeof query>;

describe("Analytics Queries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("incrementAnalytics", () => {
    it("should call INSERT ... ON CONFLICT for 'sent' status", async () => {
      mockQuery.mockResolvedValueOnce([{
        hour_bucket: new Date(),
        event_type: "MARGIN_CALL",
        channel: "sms",
        sent_count: 1,
      }]);

      // Import after mocking
      const { incrementAnalytics } = require("../src/db/queries/analytics.queries");
      const result = await incrementAnalytics("MARGIN_CALL", "sms", "sent");

      expect(mockQuery).toHaveBeenCalledTimes(1);
      const sqlCall = mockQuery.mock.calls[0][0] as string;
      expect(sqlCall).toContain("INSERT INTO analytics_hourly");
      expect(sqlCall).toContain("sent_count");
      expect(sqlCall).toContain("ON CONFLICT");
      expect(result).toBeDefined();
    });

    it("should call INSERT ... ON CONFLICT for 'failed' status", async () => {
      mockQuery.mockResolvedValueOnce([{
        hour_bucket: new Date(),
        event_type: "ORDER_EXECUTED",
        channel: "email",
        failed_count: 1,
      }]);

      const { incrementAnalytics } = require("../src/db/queries/analytics.queries");
      const result = await incrementAnalytics("ORDER_EXECUTED", "email", "failed");

      const sqlCall = mockQuery.mock.calls[0][0] as string;
      expect(sqlCall).toContain("failed_count");
      expect(result).toBeDefined();
    });

    it("should call INSERT ... ON CONFLICT for 'suppressed' status", async () => {
      mockQuery.mockResolvedValueOnce([{
        hour_bucket: new Date(),
        event_type: "PROMO",
        channel: "push",
        suppressed_count: 1,
      }]);

      const { incrementAnalytics } = require("../src/db/queries/analytics.queries");
      await incrementAnalytics("PROMO", "push", "suppressed");

      const sqlCall = mockQuery.mock.calls[0][0] as string;
      expect(sqlCall).toContain("suppressed_count");
    });

    it("should pass event_type and channel as query params", async () => {
      mockQuery.mockResolvedValueOnce([{}]);

      const { incrementAnalytics } = require("../src/db/queries/analytics.queries");
      await incrementAnalytics("TRANSACTION_ALERT", "whatsapp", "sent");

      const params = mockQuery.mock.calls[0][1] as any[];
      expect(params).toEqual(["TRANSACTION_ALERT", "whatsapp"]);
    });
  });
});

describe("Analytics Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAnalyticsSummary", () => {
    it("should query with from and to params", async () => {
      mockQuery.mockResolvedValueOnce([
        { channel: "sms", sent_count: 100, delivered_count: 95, failed_count: 3, suppressed_count: 2 },
      ]);

      const { getAnalyticsSummary } = require("../src/services/analytics.service");
      const result = await getAnalyticsSummary(
        "2026-09-22T00:00:00Z",
        "2026-09-23T00:00:00Z"
      );

      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
      expect(result[0].channel).toBe("sms");
    });

    it("should add channel filter when provided", async () => {
      mockQuery.mockResolvedValueOnce([]);

      const { getAnalyticsSummary } = require("../src/services/analytics.service");
      await getAnalyticsSummary(
        "2026-09-22T00:00:00Z",
        "2026-09-23T00:00:00Z",
        "email"
      );

      const sqlCall = mockQuery.mock.calls[0][0] as string;
      expect(sqlCall).toContain("AND channel = $3");

      const params = mockQuery.mock.calls[0][1] as any[];
      expect(params).toContain("email");
    });
  });

  describe("getAnalyticsByEventType", () => {
    it("should group by event_type", async () => {
      mockQuery.mockResolvedValueOnce([
        { event_type: "MARGIN_CALL", sent_count: 50 },
        { event_type: "ORDER_EXECUTED", sent_count: 200 },
      ]);

      const { getAnalyticsByEventType } = require("../src/services/analytics.service");
      const result = await getAnalyticsByEventType(
        "2026-09-22T00:00:00Z",
        "2026-09-23T00:00:00Z"
      );

      expect(result).toHaveLength(2);
      const sqlCall = mockQuery.mock.calls[0][0] as string;
      expect(sqlCall).toContain("GROUP BY event_type");
    });
  });

  describe("getDlqRate", () => {
    it("should return pending, resolved, and total counts", async () => {
      mockQuery.mockResolvedValueOnce([
        { pending_dlq: 4, resolved_dlq: 21, total_dlq: 25 },
      ]);

      const { getDlqRate } = require("../src/services/analytics.service");
      const result = await getDlqRate(
        "2026-09-22T00:00:00Z",
        "2026-09-23T00:00:00Z"
      );

      expect(result.pending_dlq).toBe(4);
      expect(result.resolved_dlq).toBe(21);
      expect(result.total_dlq).toBe(25);
    });
  });
});

describe("Live Analytics", () => {
  it("should be importable without errors", () => {
    const { incrementLiveCounter, getLiveCounters } = require("../src/services/liveAnalytics.service");
    expect(typeof incrementLiveCounter).toBe("function");
    expect(typeof getLiveCounters).toBe("function");
  });
});
