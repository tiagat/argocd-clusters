import { createServer, Server } from 'node:http';

import config from '~/config';

export class HealthCheck {
  private server: Server;

  constructor() {
    this.server = createServer((_, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
    });
  }

  public start() {
    this.server.listen(config.port);
  }

  public stop() {
    this.server.close();
  }
}
