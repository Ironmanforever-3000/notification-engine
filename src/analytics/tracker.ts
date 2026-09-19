import { logger } from '../infrastructure/logger';

/**
 * Service to track analytics and delivery status.
 */
export class AnalyticsTracker {
  /**
   * Tracks when a notification is sent.
   * @param notificationId - The notification ID.
   * @param channel - The channel it was sent on.
   */
  public async trackSent(notificationId: string, channel: string): Promise<void> {
    logger.info(`Tracked SENT for notification ${notificationId} on channel ${channel}`);
  }

  /**
   * Tracks when a notification is delivered.
   * @param notificationId - The notification ID.
   * @param channel - The channel it was delivered on.
   */
  public async trackDelivered(notificationId: string, channel: string): Promise<void> {
    logger.info(`Tracked DELIVERED for notification ${notificationId} on channel ${channel}`);
  }

  /**
   * Tracks when a notification fails to deliver.
   * @param notificationId - The notification ID.
   * @param channel - The channel it failed on.
   * @param error - The error message.
   */
  public async trackFailed(notificationId: string, channel: string, error: string): Promise<void> {
    logger.error(`Tracked FAILED for notification ${notificationId} on channel ${channel}. Error: ${error}`);
  }

  /**
   * Retrieves delivery statistics for an event type.
   * @param eventType - The event type.
   * @returns A promise resolving to delivery statistics.
   */
  public async getDeliveryStats(_eventType: string): Promise<{ sent: number; delivered: number; failed: number }> {
    return { sent: 0, delivered: 0, failed: 0 };
  }
}

export const analyticsTracker = new AnalyticsTracker();
