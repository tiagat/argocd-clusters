import Operator from '@dot-i/k8s-operator'
import logger from '../logger'

export class ClustersController extends Operator {
    protected async init(): Promise<void> { 
        logger.info('ArgoCD Clusters Controller initialization')
    }
}
