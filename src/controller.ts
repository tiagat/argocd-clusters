import Operator, { OperatorLogger } from '@dot-i/k8s-operator'
import cron, { ScheduledTask } from 'node-cron'
import { SecretManager } from './common/secrets-manager';
import { Kubernetes } from './common/kubernetes';

import logger from '~/logger'
import config from '~/config'

export class Controller extends Operator {

    private cron: ScheduledTask;
    private secretsManager: SecretManager;
    private kubernetes: Kubernetes;

    constructor(logger: OperatorLogger) {
        super(logger);
        this.secretsManager = new SecretManager()
        this.kubernetes = new Kubernetes()
        this.cron = cron.schedule(
            config.cron.expression, 
            this.processing.bind(this), 
            { runOnInit: false, scheduled: false }
        )
    }

    protected async init(): Promise<void> { 
        logger.info('ArgoCD Clusters Controller initializing')
        this.cron.now()
        this.cron.start()
        logger.info('ArgoCD Clusters Controller started')
    }

    override async stop(): Promise<void> {
        this.cron.stop()
        await super.stop()
    }

    async processing() {
        try {
            const awsSecrets = this.secretsManager.scanStoredSecrets()
            const k8sSecrets = this.kubernetes.getClusterSecrets()
        } catch (error) {
            logger.error(error)
        } 
    }
}
