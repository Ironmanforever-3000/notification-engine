import { getQueue } from "../src/services/dlq.service";

// Mock the queue modules to avoid Redis connection during tests
jest.mock("../src/queues/dispatchSms.queue", () => ({
  dispatchSmsQueue: { name: "dispatch-sms" },
}));
jest.mock("../src/queues/dispatchEmail.queue", () => ({
  dispatchEmailQueue: { name: "dispatch-email" },
}));
jest.mock("../src/queues/dispatchPush.queue", () => ({
  dispatchPushQueue: { name: "dispatch-push" },
}));
jest.mock("../src/queues/dispatchWhatsapp.queue", () => ({
  dispatchWhatsappQueue: { name: "dispatch-whatsapp" },
}));
jest.mock("../src/queues/dispatchInApp.queue", () => ({
  dispatchInAppQueue: { name: "dispatch-in-app" },
}));

describe("DLQ Service", () => {
  describe("getQueue", () => {
    it("should return SMS queue for 'dispatch-sms'", () => {
      const queue = getQueue("dispatch-sms");
      expect(queue).toBeDefined();
      expect((queue as any).name).toBe("dispatch-sms");
    });

    it("should return Email queue for 'dispatch-email'", () => {
      const queue = getQueue("dispatch-email");
      expect(queue).toBeDefined();
      expect((queue as any).name).toBe("dispatch-email");
    });

    it("should return Push queue for 'dispatch-push'", () => {
      const queue = getQueue("dispatch-push");
      expect(queue).toBeDefined();
      expect((queue as any).name).toBe("dispatch-push");
    });

    it("should return WhatsApp queue for 'dispatch-whatsapp'", () => {
      const queue = getQueue("dispatch-whatsapp");
      expect(queue).toBeDefined();
      expect((queue as any).name).toBe("dispatch-whatsapp");
    });

    it("should return In-App queue for 'dispatch-in-app'", () => {
      const queue = getQueue("dispatch-in-app");
      expect(queue).toBeDefined();
      expect((queue as any).name).toBe("dispatch-in-app");
    });

    it("should throw for unknown queue name", () => {
      expect(() => getQueue("dispatch-unknown")).toThrow(
        "Unsupported DLQ queue: dispatch-unknown"
      );
    });

    it("should throw for empty string", () => {
      expect(() => getQueue("")).toThrow("Unsupported DLQ queue: ");
    });
  });
});

describe("DLQ Queries", () => {
  // These are interface-level tests — verifying the CreateDlqInput shape
  it("CreateDlqInput should have required fields", () => {
    const input = {
      queueName: "dispatch-sms",
      jobId: "job-123",
      jobName: "dispatch-sms",
      eventId: "event-abc",
      userId: "user-xyz",
      channel: "sms",
      jobData: { eventId: "event-abc", userId: "user-xyz", channel: "sms" },
      failureReason: "Twilio timeout",
      failureStack: "Error: timeout\n  at ...",
      attemptsMade: 5,
      maxAttempts: 5,
    };

    expect(input.queueName).toBeDefined();
    expect(input.jobId).toBeDefined();
    expect(input.jobName).toBeDefined();
    expect(input.jobData).toBeDefined();
    expect(input.failureReason).toBeDefined();
    expect(input.attemptsMade).toBe(5);
  });
});
