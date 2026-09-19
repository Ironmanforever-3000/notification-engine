import dotenv from 'dotenv';
dotenv.config();

import { eventRegistry } from './config/event-registry';
import { channelRouter } from './channels/channel-router';
import { Channel } from './events/types';
import { SmsChannel } from './channels/sms';
import { EmailChannel } from './channels/email';
import { PushChannel } from './channels/push';
import { WhatsAppChannel } from './channels/whatsapp';
import { InAppChannel } from './channels/in-app';
import { logger } from './infrastructure/logger';
import { prisma } from './config/database';

/**
 * Bootstraps the Notification Engine:
 * - Loads the event registry
 * - Registers all channel handlers
 */
async function bootstrap(): Promise<void> {
  logger.info('Starting Notification Engine...');

  const eventTypes = eventRegistry.getAll();
  logger.info(`Registered ${eventTypes.length} event types`);

  channelRouter.register(Channel.SMS, new SmsChannel());
  channelRouter.register(Channel.EMAIL, new EmailChannel());
  channelRouter.register(Channel.PUSH, new PushChannel());
  channelRouter.register(Channel.WHATSAPP, new WhatsAppChannel());
  channelRouter.register(Channel.IN_APP, new InAppChannel());

  const channels = channelRouter.getRegisteredChannels();
  logger.info(`Registered channels: ${channels.join(', ')}`);

  logger.info('Notification Engine ready');
}

/**
 * Graceful shutdown: disconnects database and exits.
 */
async function shutdown(): Promise<void> {
  logger.info('Shutting down Notification Engine...');
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

bootstrap().catch((err: unknown) => {
  logger.error(err, 'Failed to start Notification Engine');
  process.exit(1);
});
