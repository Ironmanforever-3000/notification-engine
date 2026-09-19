import { ChannelHandler } from './channel-router';
import { logger } from '../infrastructure/logger';

/**
 * InAppChannel handler.
 * This is a stub that will eventually use the database for In-App notifications.
 */
export class InAppChannel implements ChannelHandler {
    /**
     * Sends an in-app notification.
     * @param userId The user ID to send to.
     * @param payload The notification payload.
     * @returns The send result.
     */
    public async send(userId: string, payload: Record<string, unknown>): Promise<{ success: boolean; providerResponse?: Record<string, unknown>; error?: string }> {
        logger.info({ userId, payload }, 'Attempting to send In-App notification');
        return {
            success: true,
            providerResponse: {
                provider: 'stub',
                channel: 'in-app',
                timestamp: new Date().toISOString()
            }
        };
    }
}
