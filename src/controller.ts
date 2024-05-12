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
            const awsSecrets = await this.secretsManager.scanStoredSecrets()
            const awsSecretsMap = new Map(awsSecrets.map(item => [item.secret.name, item.version]))

            const k8sSecrets = await this.kubernetes.getClusterSecrets()
            const k8sSecretsMap = new Map(k8sSecrets.map(item => [item.name, item.version]))

            for (const item of awsSecrets) {
                if (!k8sSecretsMap.has(item.secret.name)) {
                    logger.info(`Created secret: ${item.secret.name}`)
                    await this.kubernetes.createSecret(item)
                }
            }

            for (const item of awsSecrets) {
                const awsVersion = awsSecretsMap.get(item.secret.name)
                const k8sVersion = k8sSecretsMap.get(item.secret.name)
                if (k8sSecretsMap.has(item.secret.name) && awsVersion !== k8sVersion) {
                    logger.info(`Updated secret: ${item.secret.name}`)
                    await this.kubernetes.updateSecret(item)
                }
            }

            for (const item of k8sSecrets) {
                if (!awsSecretsMap.has(item.name)) {
                    logger.info(`Deleted secret: ${item.name}`)
                    await this.kubernetes.deleteSecret(item.name)
                }
            }
    
        } catch (error) {
            logger.error(error)
        } 
    }
}
