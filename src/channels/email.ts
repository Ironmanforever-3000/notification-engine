import { ChannelHandler } from './channel-router';
import { logger } from '../infrastructure/logger';

/**
 * EmailChannel handler.
 * This is a stub that will eventually use SendGrid for Email.
 */
export class EmailChannel implements ChannelHandler {
    /**
     * Sends an email notification.
     * @param userId The user ID to send to.
     * @param payload The notification payload.
     * @returns The send result.
     */
    public async send(userId: string, payload: Record<string, unknown>): Promise<{ success: boolean; providerResponse?: Record<string, unknown>; error?: string }> {
        logger.info({ userId, payload }, 'Attempting to send Email');
        return {
            success: true,
            providerResponse: {
                provider: 'stub',
                channel: 'email',
                timestamp: new Date().toISOString()
            }
        };
    }
}
