import { ChannelHandler } from './channel-router';
import { logger } from '../infrastructure/logger';

/**
 * PushChannel handler.
 * This is a stub that will eventually use Firebase for Push.
 */
export class PushChannel implements ChannelHandler {
    /**
     * Sends a push notification.
     * @param userId The user ID to send to.
     * @param payload The notification payload.
     * @returns The send result.
     */
    public async send(userId: string, payload: Record<string, unknown>): Promise<{ success: boolean; providerResponse?: Record<string, unknown>; error?: string }> {
        logger.info({ userId, payload }, 'Attempting to send Push notification');
        return {
            success: true,
            providerResponse: {
                provider: 'stub',
                channel: 'push',
                timestamp: new Date().toISOString()
            }
        };
    }
}
