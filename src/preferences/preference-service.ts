import { EventTypeName, Channel } from '../events/types';
export interface UserPreference {
  channel: Channel;
  enabled: boolean;
}

/**
 * Service to manage user preferences.
 */
export class PreferenceService {
  /**
   * Retrieves user preferences for a specific event type.
   * @param userId - The user ID.
   * @param eventType - The event type.
   * @returns A promise resolving to an array of user preferences.
   */
  public async getUserPreferences(_userId: string, _eventType: EventTypeName): Promise<UserPreference[]> {
    return [];
  }

  /**
   * Calculates the effective channels based on preferences and defaults.
   * @param userId - The user ID.
   * @param eventType - The event type.
   * @param defaultChannels - The default channels for the event.
   * @returns A promise resolving to an array of effective channels.
   */
  public async getEffectiveChannels(_userId: string, _eventType: EventTypeName, defaultChannels: Channel[]): Promise<Channel[]> {
    return defaultChannels;
  }

  /**
   * Checks if a user has opted in to marketing notifications.
   * @param userId - The user ID.
   * @returns A promise resolving to true if opted in.
   */
  public async hasMarketingOptin(_userId: string): Promise<boolean> {
    return false;
  }
}

export const preferenceService = new PreferenceService();
