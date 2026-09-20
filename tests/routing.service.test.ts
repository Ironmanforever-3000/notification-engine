import { routeEvent } from "../src/services/routing.service";

jest.mock("../src/queues/dispatchSms.queue", () => ({
  dispatchSmsQueue: {
    add: jest.fn(),
  },
}));

jest.mock("../src/queues/dispatchEmail.queue", () => ({
  dispatchEmailQueue: {
    add: jest.fn(),
  },
}));

jest.mock("../src/config/event-registry", () => ({
  getEventTypeConfig: jest.fn(() => ({
    event_type: "MARGIN_CALL",
    tier: "CRITICAL",
    default_channels: ["sms", "push"],
    description: "Margin call notification",
  })),
}));

import { dispatchSmsQueue } from "../src/queues/dispatchSms.queue";
import { dispatchEmailQueue } from "../src/queues/dispatchEmail.queue";

describe("routing service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("routes MARGIN_CALL to SMS and not email", async () => {
    const result = await routeEvent({
      eventId: "event-123",
      eventType: "MARGIN_CALL",
      userId: "user-123",
    });

    expect(result.channels).toEqual(["sms", "push"]);
    expect(dispatchSmsQueue.add).toHaveBeenCalledTimes(1);
    expect(dispatchSmsQueue.add).toHaveBeenCalledWith("dispatch-sms", {
      eventId: "event-123",
      userId: "user-123",
      channel: "sms",
    });
    expect(dispatchEmailQueue.add).not.toHaveBeenCalled();
  });
});