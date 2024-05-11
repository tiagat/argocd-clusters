import logger from '../logger'
import Operator, { OperatorLogger } from '@dot-i/k8s-operator'
import cron, { ScheduledTask } from 'node-cron'

import config from '../config'

export class ClustersController extends Operator {

    private cron: ScheduledTask;

    constructor(logger: OperatorLogger) {
        super(logger);
        this.cron = cron.schedule(config.cron.expression, this.processing, { runOnInit: false, scheduled: false })
    }

    protected async init(): Promise<void> { 
        logger.info('ArgoCD Clusters Controller starting...')
        await this.processing()
        this.cron.start()
    }

    override async stop(): Promise<void> {
        this.cron.stop()
        await super.stop()
    }

    async processing() {
        logger.info('Syncing clusters...')
    }
}
