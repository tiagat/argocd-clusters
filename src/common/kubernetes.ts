import { KubeConfig, CoreV1Api } from '@kubernetes/client-node';

import config from '~/config';

export class Kubernetes {

    private k8s: CoreV1Api;

    constructor() {
        const kc = new KubeConfig;
        kc.loadFromDefault();
        this.k8s = kc.makeApiClient(CoreV1Api);
    }

    async getClusterSecrets() {
        const namespace = config.argocd.namespace;
        const timeoutSeconds = 5;
        const labelSelector = 'argocd.argoproj.io/secret-type=cluster'
        const secrets = await this.k8s.listNamespacedSecret(
            namespace, 
            undefined, 
            undefined, 
            undefined, 
            undefined, 
            labelSelector,
            undefined,
            undefined,
            undefined,
            undefined,
            timeoutSeconds,
            undefined,
            undefined
        );
        return await Promise.resolve([]);
    }
}
