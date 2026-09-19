import { Tier } from '../events/types';
/**
 * Service to check Do Not Disturb (DND) compliance.
 */
export class DndChecker {
  /**
   * Checks if the given tier should bypass DND.
   * @param tier - The event tier.
   * @returns true if the tier is CRITICAL.
   */
  public shouldBypassDnd(tier: Tier): boolean {
    return tier === 'CRITICAL';
  }

  /**
   * Checks if a user is currently in DND mode.
   * @param userId - The user ID.
   * @returns A promise resolving to a boolean.
   */
  public async isUserInDnd(_userId: string): Promise<boolean> {
    return false;
  }

  /**
   * Checks if a notification can be sent based on DND rules.
   * @param userId - The user ID.
   * @param tier - The event tier.
   * @returns A promise resolving to the allowed status and optional reason.
   */
  public async canSend(userId: string, tier: Tier): Promise<{ allowed: boolean; reason?: string }> {
    if (this.shouldBypassDnd(tier)) {
      return { allowed: true };
    }
    const inDnd = await this.isUserInDnd(userId);
    if (inDnd) {
      return { allowed: false, reason: 'User is in DND' };
    }
    return { allowed: true };
  }
}

export const dndChecker = new DndChecker();
