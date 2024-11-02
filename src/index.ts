import 'reflect-metadata';

import { Controller } from './controller';
import logger from './logger';

const controller = new Controller(logger);

function gracefulShutdown(reason: string) {
  logger.info(`Received ${reason} signal. Shutting down...`);
  controller.stop();
  process.exit(0);
}

async function main() {
  await controller.start();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM')).on('SIGINT', () => gracefulShutdown('SIGINT'));

main().catch((err) => logger.error(err));
