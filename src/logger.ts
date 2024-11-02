import Pino, { destination } from 'pino';
import type { BaseLogger, Level, LoggerOptions } from 'pino';

import config from './config';

const options: LoggerOptions = {
  level: config.logger.level,
};

const stdout = Pino(options);
const stderr = Pino(options, destination(2));

const logger: Pick<BaseLogger, Level> = {
  trace: stdout.trace.bind(stdout),
  info: stdout.info.bind(stdout),
  debug: stdout.debug.bind(stdout),
  warn: stdout.warn.bind(stdout),
  error: stderr.error.bind(stderr),
  fatal: stderr.fatal.bind(stderr),
};

export default logger;
