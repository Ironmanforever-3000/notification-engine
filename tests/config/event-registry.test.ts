import { eventRegistry } from '../../src/config/event-registry';
import { Tier, Channel } from '../../src/events/types';

describe('EventRegistry', () => {
  it('should load all 28 event types', () => {
    expect(eventRegistry.getAll().length).toBe(28);
  });

  it('should find MARGIN_CALL', () => {
    expect(eventRegistry.get('MARGIN_CALL')).toBeDefined();
  });

  it('should return undefined for unknown event', () => {
    expect(eventRegistry.get('UNKNOWN_EVENT' as any)).toBeUndefined();
  });

  it('should identify critical events', () => {
    expect(eventRegistry.isCritical('MARGIN_CALL')).toBe(true);
    expect(eventRegistry.isCritical('ORDER_EXECUTED')).toBe(false);
  });

  it('should return all critical events with getByTier', () => {
    expect(eventRegistry.getByTier(Tier.CRITICAL).length).toBe(5);
  });

  it('should return all high events with getByTier', () => {
    expect(eventRegistry.getByTier(Tier.HIGH).length).toBe(6);
  });

  it('should return all normal events with getByTier', () => {
    expect(eventRegistry.getByTier(Tier.NORMAL).length).toBe(9);
  });

  it('should return all low events with getByTier', () => {
    expect(eventRegistry.getByTier(Tier.LOW).length).toBe(4);
  });

  it('should return all regulatory events with getByTier', () => {
    expect(eventRegistry.getByTier(Tier.REGULATORY).length).toBe(4);
  });

  it('should identify optin requirements for low tier events', () => {
    expect(eventRegistry.requiresOptin('PROMOTIONAL_OFFER')).toBe(true);
  });

  it('should not require optin for critical events', () => {
    expect(eventRegistry.requiresOptin('MARGIN_CALL')).toBe(false);
  });

  it('should return default channels for MARGIN_CALL', () => {
    const channels = eventRegistry.getDefaultChannels('MARGIN_CALL');
    expect(channels).toContain(Channel.SMS);
    expect(channels).toContain(Channel.PUSH);
    expect(channels).toContain(Channel.IN_APP);
  });
});
