import { validateEvent } from '../../src/events/event-validator';
import crypto from 'crypto';

describe('Event Validator', () => {
  it('should validate a correct event', () => {
    const result = validateEvent({
      event_type: 'ORDER_EXECUTED',
      user_id: crypto.randomUUID(),
      payload: { amount: 100 },
      timestamp: new Date().toISOString(),
    });
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('should reject event with missing event_type', () => {
    const result = validateEvent({
      user_id: crypto.randomUUID(),
      payload: { amount: 100 },
    });
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should reject event with invalid user_id format', () => {
    const result = validateEvent({
      event_type: 'ORDER_EXECUTED',
      user_id: 'not-a-uuid',
      payload: { amount: 100 },
    });
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should reject event with unknown event_type', () => {
    const result = validateEvent({
      event_type: 'UNKNOWN_EVENT',
      user_id: crypto.randomUUID(),
      payload: { amount: 100 },
    });
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should accept event with optional sub_type', () => {
    const result = validateEvent({
      event_type: 'TRANSACTION_ALERT',
      sub_type: 'DEBIT',
      user_id: crypto.randomUUID(),
      payload: { amount: 100 },
    });
    expect(result.success).toBe(true);
  });

  it('should reject event with invalid sub_type', () => {
    const result = validateEvent({
      event_type: 'TRANSACTION_ALERT',
      sub_type: 'INVALID',
      user_id: crypto.randomUUID(),
      payload: { amount: 100 },
    });
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should accept event with empty payload', () => {
    const result = validateEvent({
      event_type: 'ORDER_EXECUTED',
      user_id: crypto.randomUUID(),
      payload: {},
    });
    expect(result.success).toBe(true);
  });
});

