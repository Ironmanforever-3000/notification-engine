import { ChannelHandler } from './channel-router';
import { logger } from '../infrastructure/logger';

/**
 * SmsChannel handler.
 * This is a stub that will eventually use Twilio for SMS.
 */
export class SmsChannel implements ChannelHandler {
    /**
     * Sends an SMS notification.
     * @param userId The user ID to send to.
     * @param payload The notification payload.
     * @returns The send result.
     */
    public async send(userId: string, payload: Record<string, unknown>): Promise<{ success: boolean; providerResponse?: Record<string, unknown>; error?: string }> {
        logger.info({ userId, payload }, 'Attempting to send SMS');
        return {
            success: true,
            providerResponse: {
                provider: 'stub',
                channel: 'sms',
                timestamp: new Date().toISOString()
            }
        };
    }
}
