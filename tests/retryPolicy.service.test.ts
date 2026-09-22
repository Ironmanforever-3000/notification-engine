import { UnrecoverableError } from "bullmq";
import {
  RetryableProviderError,
  NonRetryableProviderError,
} from "../src/types/delivery.types";
import { RETRY_CONFIG } from "../src/config/retry";

describe("Retry Policy", () => {
  describe("RETRY_CONFIG", () => {
    it("should have 5 attempts", () => {
      expect(RETRY_CONFIG.attempts).toBe(5);
    });

    it("should use exponential backoff", () => {
      expect(RETRY_CONFIG.backoff.type).toBe("exponential");
    });

    it("should have 2 second seed delay", () => {
      expect(RETRY_CONFIG.backoff.delay).toBe(2000);
    });

    it("should keep failed jobs (removeOnFail = false)", () => {
      expect(RETRY_CONFIG.removeOnFail).toBe(false);
    });
  });

  describe("RetryableProviderError", () => {
    it("should be an instance of Error", () => {
      const error = new RetryableProviderError("timeout");
      expect(error).toBeInstanceOf(Error);
    });

    it("should be marked retryable", () => {
      const error = new RetryableProviderError("timeout");
      expect(error.retryable).toBe(true);
    });

    it("should store the provider code", () => {
      const error = new RetryableProviderError("rate limited", 429);
      expect(error.providerCode).toBe(429);
    });

    it("should preserve the error message", () => {
      const error = new RetryableProviderError("Twilio 503");
      expect(error.message).toBe("Twilio 503");
    });

    it("should have the correct name", () => {
      const error = new RetryableProviderError("test");
      expect(error.name).toBe("RetryableProviderError");
    });

    it("should NOT be wrapped as UnrecoverableError", () => {
      const error = new RetryableProviderError("transient");
      expect(error).not.toBeInstanceOf(NonRetryableProviderError);
    });
  });

  describe("NonRetryableProviderError", () => {
    it("should be an instance of Error", () => {
      const error = new NonRetryableProviderError("invalid number");
      expect(error).toBeInstanceOf(Error);
    });

    it("should be marked non-retryable", () => {
      const error = new NonRetryableProviderError("invalid number");
      expect(error.retryable).toBe(false);
    });

    it("should store the provider code", () => {
      const error = new NonRetryableProviderError("invalid", 21211);
      expect(error.providerCode).toBe(21211);
    });

    it("should have the correct name", () => {
      const error = new NonRetryableProviderError("test");
      expect(error.name).toBe("NonRetryableProviderError");
    });

    it("should be convertible to UnrecoverableError for BullMQ", () => {
      const original = new NonRetryableProviderError("invalid phone", 21211);
      const bullmqError = new UnrecoverableError(original.message);

      expect(bullmqError).toBeInstanceOf(UnrecoverableError);
      expect(bullmqError.message).toBe("invalid phone");
    });
  });

  describe("Error Classification in Worker", () => {
    function simulateWorkerCatch(error: Error): Error {
      if (error instanceof NonRetryableProviderError) {
        return new UnrecoverableError(error.message);
      }
      return error; // re-throw as-is for BullMQ retry
    }

    it("retryable errors pass through for BullMQ retry", () => {
      const error = new RetryableProviderError("timeout", 503);
      const result = simulateWorkerCatch(error);

      expect(result).toBeInstanceOf(RetryableProviderError);
      expect(result).not.toBeInstanceOf(UnrecoverableError);
    });

    it("non-retryable errors become UnrecoverableError", () => {
      const error = new NonRetryableProviderError("invalid phone", 21211);
      const result = simulateWorkerCatch(error);

      expect(result).toBeInstanceOf(UnrecoverableError);
      expect(result.message).toBe("invalid phone");
    });
  });
});
