import { NotificationEvent, NotificationStatus } from '../events/types';
import { logger } from '../infrastructure/logger';

export interface NotificationRecord {
    id: string;
    status: NotificationStatus;
}

/**
 * NotificationService
 * 
 * Central orchestrator that will: 
 * - validate event
 * - check preferences
 * - check compliance
 * - select template
 * - route to channels
 */
export class NotificationService {
    /**
     * Creates a new notification record from an event.
     * @param event The notification event.
     * @returns A promise resolving to the created notification record.
     */
    public async createNotification(event: NotificationEvent): Promise<NotificationRecord> {
        logger.info({ event }, 'Creating notification stub');
        return {
            id: 'stub-id',
            status: NotificationStatus.PENDING
        };
    }

    /**
     * Processes a notification by its ID.
     * @param notificationId The ID of the notification to process.
     */
    public async processNotification(notificationId: string): Promise<void> {
        logger.info({ notificationId }, 'Processing notification stub');
    }

    /**
     * Gets the current status of a notification.
     * @param notificationId The ID of the notification.
     * @returns A promise resolving to the notification status.
     */
    public async getNotificationStatus(notificationId: string): Promise<NotificationStatus> {
        logger.info({ notificationId }, 'Getting notification status stub');
        return NotificationStatus.PENDING;
    }
}
