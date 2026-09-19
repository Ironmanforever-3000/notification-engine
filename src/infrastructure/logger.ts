import pino from 'pino';

const level = process.env.LOG_LEVEL || 'info';
const isDev = process.env.NODE_ENV !== 'production';

/**
 * Creates the base pino logger instance.
 */
const logger = pino({
  level,
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  }),
});

/**
 * Creates a child logger with a specific context.
 * @param context The context string for the child logger
 * @returns A pino child logger
 */
export function createChildLogger(context: string): pino.Logger {
  return logger.child({ context });
}

export { logger };
