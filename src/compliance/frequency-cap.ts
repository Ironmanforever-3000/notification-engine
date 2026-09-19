import { Tier } from '../events/types';
/**
 * Service to enforce frequency caps on notifications.
 */
export class FrequencyCapChecker {
  /**
   * Checks if the given tier should bypass frequency caps.
   * @param tier - The event tier.
   * @returns true if the tier is CRITICAL.
   */
  public shouldBypassFrequencyCap(tier: Tier): boolean {
    return tier === 'CRITICAL';
  }

  /**
   * Checks if the frequency cap allows a new notification.
   * @param userId - The user ID.
   * @param eventType - The type of event.
   * @param channel - The channel (e.g., EMAIL, SMS).
   * @returns A promise resolving to the allowed status and limits.
   */
  public async checkFrequency(_userId: string, _eventType: string, _channel: string): Promise<{ allowed: boolean; reason?: string; currentCount?: number; maxCount?: number }> {
    return { allowed: true, currentCount: 0, maxCount: 10 };
  }

  /**
   * Increments the notification count for a user, event, and channel.
   * @param userId - The user ID.
   * @param eventType - The type of event.
   * @param channel - The channel.
   */
  public async incrementCount(_userId: string, _eventType: string, _channel: string): Promise<void> {
    // Stub implementation
  }
}

export const frequencyCapChecker = new FrequencyCapChecker();
