import path from 'node:path';
import { readFileSync } from 'node:fs';
import { config, parse } from 'dotenv';
import { validate } from 'node-cron';
import type { Level } from 'pino';

config({ path: path.join(__dirname, '..', process.env['NODE_ENV'] === 'test' ? '.env.test' : '.env') });

const missedEnvironmentVariables = Object.keys(parse(readFileSync(path.join(__dirname, '..', '.env.example')))).filter(
  (exampleKey) => !process.env[exampleKey]
);
if (missedEnvironmentVariables.length > 0) throw new Error(`${missedEnvironmentVariables.join(', ')} not defined`);

const cronExpression = process.env['CRON_EXPRESSION']!;
if (!validate(cronExpression)) throw new Error(`Invalid cron expression: ${cronExpression}`);

export default {
  port: parseInt(process.env['PORT']!),
  logger: {
    level: process.env['LOG_LEVEL'] as Level
  },
  cron: {
    expression: cronExpression
  },
  aws: {
    region: process.env['AWS_REGION']!,
    secrets: {
      prefix: process.env['AWS_SECRETS_PREFIX']!
    }
  },
  argocd: {
    namespace: process.env['ARGOCD_NAMESPACE']!
  }
};
