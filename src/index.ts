import { ClustersController } from './common/clusters-controller'
import logger from './logger'

const controller = new ClustersController(logger)

function gracefulShutdown(reason: string) {
    logger.info(`Shutting down because of ${reason}`)
    controller.stop()
    process.exit(0);
}

async function main() {
    await controller.start()
}

process
    .on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    .on('SIGINT', () => gracefulShutdown('SIGINT'));

main().catch(err => logger.error(err))
