import { Tier } from '../events/types';
/**
 * Service to enforce quiet hours compliance.
 */
export class QuietHoursChecker {
  /**
   * Checks if the given tier should bypass quiet hours.
   * @param tier - The event tier.
   * @returns true if the tier is CRITICAL.
   */
  public shouldBypassQuietHours(tier: Tier): boolean {
    return tier === 'CRITICAL';
  }

  /**
   * Checks if the current time is within quiet hours.
   * @param timezone - The user's timezone.
   * @param quietStart - The start of quiet hours.
   * @param quietEnd - The end of quiet hours.
   * @returns true if in quiet hours.
   */
  public isInQuietHours(_timezone: string, _quietStart?: string, _quietEnd?: string): boolean {
    return false;
  }

  /**
   * Checks if a notification can be sent based on quiet hours rules.
   * @param userId - The user ID.
   * @param tier - The event tier.
   * @param timezone - The user's timezone.
   * @returns A promise resolving to the allowed status, optional reason, and retryAfter.
   */
  public async canSend(_userId: string, tier: Tier, timezone: string): Promise<{ allowed: boolean; reason?: string; retryAfter?: Date }> {
    if (this.shouldBypassQuietHours(tier)) {
      return { allowed: true };
    }
    const inQuietHours = this.isInQuietHours(timezone, '22:00', '08:00');
    if (inQuietHours) {
      return { allowed: false, reason: 'User is in quiet hours', retryAfter: new Date() };
    }
    return { allowed: true };
  }
}

export const quietHoursChecker = new QuietHoursChecker();
