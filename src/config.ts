import path from 'node:path';
import { readFileSync } from 'node:fs';
import { config, parse } from 'dotenv';

import type { Level } from 'pino';

config({ path: path.join(__dirname, '..', process.env['NODE_ENV'] === 'test' ? '.env.test' : '.env') });

const missedEnvironmentVariables = Object.keys(parse(readFileSync(path.join(__dirname, '..', '.env.example')))).filter(
    (exampleKey) => !process.env[exampleKey]
  );
if (missedEnvironmentVariables.length > 0) throw new Error(`${missedEnvironmentVariables.join(', ')} not defined`);


export default {
    logger: {
        level: process.env['LOG_LEVEL'] as Level,
    }
}
