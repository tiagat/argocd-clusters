import Operator, { OperatorLogger } from '@dot-i/k8s-operator'
import cron, { ScheduledTask } from 'node-cron'
import { SecretsManager } from './secrets-manager';

import logger from '~/logger'
import config from '~/config'

export class ClustersController extends Operator {

    private cron: ScheduledTask;
    private secretsManager: SecretsManager;

    constructor(logger: OperatorLogger) {
        super(logger);
        this.secretsManager = new SecretsManager()
        this.cron = cron.schedule(config.cron.expression, this.processing, { runOnInit: false, scheduled: false })
    }

    protected async init(): Promise<void> { 
        logger.info('ArgoCD Clusters Controller starting...')
        this.cron.now()
        this.cron.start()
    }

    override async stop(): Promise<void> {
        this.cron.stop()
        await super.stop()
    }

    async processing() {
        logger.info('Syncing clusters...')
        try {
            // const t = this.secretsManager;
            // const secrets = await this.secretsManager.getSecrets()
        } catch (error) {
            logger.error(error)
        } 
    }
}
