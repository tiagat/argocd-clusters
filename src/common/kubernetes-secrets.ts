import k8s = require('@kubernetes/client-node');

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

export class KubernetesSecrets {
    async getClusterSecrets() {
        const secrets = await k8sApi.listSecretForAllNamespaces()
        return await Promise.resolve([]);
    }
}
