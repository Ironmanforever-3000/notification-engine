import { ChannelHandler } from './channel-router';
import { logger } from '../infrastructure/logger';

/**
 * WhatsAppChannel handler.
 * This is a stub that will eventually use Meta/Twilio for WhatsApp.
 */
export class WhatsAppChannel implements ChannelHandler {
    /**
     * Sends a WhatsApp notification.
     * @param userId The user ID to send to.
     * @param payload The notification payload.
     * @returns The send result.
     */
    public async send(userId: string, payload: Record<string, unknown>): Promise<{ success: boolean; providerResponse?: Record<string, unknown>; error?: string }> {
        logger.info({ userId, payload }, 'Attempting to send WhatsApp message');
        return {
            success: true,
            providerResponse: {
                provider: 'stub',
                channel: 'whatsapp',
                timestamp: new Date().toISOString()
            }
        };
    }
}
