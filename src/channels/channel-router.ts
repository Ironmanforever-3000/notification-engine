import { Channel } from '../events/types';
import { logger } from '../infrastructure/logger';

export interface ChannelHandler {
    send(userId: string, payload: Record<string, unknown>): Promise<{ success: boolean; providerResponse?: Record<string, unknown>; error?: string }>;
}

/**
 * Routes notifications to the correct channel handler.
 */
export class ChannelRouter {
    private handlers: Map<Channel, ChannelHandler> = new Map();

    /**
     * Registers a handler for a specific channel.
     * @param channel The channel to register for.
     * @param handler The handler implementation.
     */
    public register(channel: Channel, handler: ChannelHandler): void {
        this.handlers.set(channel, handler);
        logger.info({ channel }, 'Channel handler registered');
    }

    /**
     * Routes a payload to the registered channel handler.
     * @param channel The channel to route to.
     * @param userId The ID of the user.
     * @param payload The payload to send.
     * @returns The result of the send operation.
     */
    public async route(channel: Channel, userId: string, payload: Record<string, unknown>): Promise<{ success: boolean; providerResponse?: Record<string, unknown>; error?: string }> {
        const handler = this.handlers.get(channel);
        if (!handler) {
            return { success: false, error: `No handler registered for channel: ${channel}` };
        }
        return handler.send(userId, payload);
    }

    /**
     * Gets all registered channels.
     * @returns An array of registered channels.
     */
    public getRegisteredChannels(): Channel[] {
        return Array.from(this.handlers.keys());
    }
}

export const channelRouter = new ChannelRouter();
