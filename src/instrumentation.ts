import * as Sentry from '@sentry/nextjs';
import { logger } from '~/lib/logger';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');

    // Graceful shutdown hooks (Node runtime only)
    const shutdown = async (signal: string) => {
      try {
        logger.warn(`Received ${signal}, initiating graceful shutdown...`);
        // Flush Sentry and other async loggers if any
        await Sentry.flush(2000);
      } catch (e) {
        logger.error('Error during shutdown', { error: (e as Error)?.message });
      } finally {
        process.exit(0);
      }
    };

    process.once('SIGTERM', () => void shutdown('SIGTERM'));
    process.once('SIGINT', () => void shutdown('SIGINT'));
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
