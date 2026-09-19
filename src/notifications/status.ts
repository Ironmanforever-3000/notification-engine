import { NotificationStatus } from '../events/types';

/**
 * Checks if the notification status is a terminal state.
 * @param status The notification status to check.
 * @returns True if the status is terminal (SENT, DELIVERED, FAILED, CANCELLED).
 */
export function isTerminalStatus(status: NotificationStatus): boolean {
    return [
        NotificationStatus.SENT,
        NotificationStatus.DELIVERED,
        NotificationStatus.FAILED,
        NotificationStatus.CANCELLED
    ].includes(status);
}

/**
 * Checks if the notification status allows for a retry.
 * @param status The notification status.
 * @returns True if the status is FAILED.
 */
export function isRetryableStatus(status: NotificationStatus): boolean {
    return status === NotificationStatus.FAILED;
}

/**
 * Gets valid next statuses from a given status.
 * @param status The current notification status.
 * @returns An array of valid next statuses.
 */
export function getStatusTransitions(status: NotificationStatus): NotificationStatus[] {
    switch (status) {
        case NotificationStatus.PENDING:
            return [NotificationStatus.QUEUED, NotificationStatus.CANCELLED];
        case NotificationStatus.QUEUED:
            return [NotificationStatus.PROCESSING, NotificationStatus.CANCELLED];
        case NotificationStatus.PROCESSING:
            return [NotificationStatus.SENT, NotificationStatus.FAILED, NotificationStatus.CANCELLED];
        case NotificationStatus.SENT:
            return [NotificationStatus.DELIVERED, NotificationStatus.FAILED];
        case NotificationStatus.FAILED:
            return [NotificationStatus.PROCESSING];
        case NotificationStatus.DELIVERED:
        case NotificationStatus.CANCELLED:
            return [];
        default:
            return [];
    }
}
