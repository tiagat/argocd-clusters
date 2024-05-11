import Operator, { OperatorLogger } from '@dot-i/k8s-operator'
import cron, { ScheduledTask } from 'node-cron'
import { AWSSecretManager } from './common/aws-secrets-manager';
import { KubernetesSecrets } from './common/kubernetes-secrets';

import logger from '~/logger'
import config from '~/config'

export class Controller extends Operator {

    private cron: ScheduledTask;
    private secretsManager: AWSSecretManager;
    private kubernetesSecrets: KubernetesSecrets;

    constructor(logger: OperatorLogger) {
        super(logger);
        this.secretsManager = new AWSSecretManager()
        this.kubernetesSecrets = new KubernetesSecrets()
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
            const awsSecrets = this.secretsManager.getClusterSecrets()
            const k8sSecrets = this.kubernetesSecrets.getClusterSecrets()
        } catch (error) {
            logger.error(error)
        } 
    }
}
