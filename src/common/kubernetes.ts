import { CoreV1Api, KubeConfig, V1Secret } from '@kubernetes/client-node';

import config from '~/config';
import { ClusterMetadata } from './interfaces';
import logger from '~/logger';

const AWS_SECRET_VERSION_KEY = 'aws-secret-version';

export interface SecretInfo {
  name: string;
  version: string;
}

export class Kubernetes {
  private k8s: CoreV1Api;

  constructor() {
    const kc = new KubeConfig();
    kc.loadFromDefault();
    this.k8s = kc.makeApiClient(CoreV1Api);
  }

  async getClusterSecrets(): Promise<SecretInfo[]> {
    const timeoutSeconds = 5;
    const labelSelector = 'argocd.argoproj.io/secret-type=cluster';
    const secrets = await this.k8s.listNamespacedSecret(
      config.argocd.namespace,
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
    return secrets.body.items.map((item) => ({
      name: item.metadata?.name || '',
      version: item.metadata?.annotations?.[AWS_SECRET_VERSION_KEY] || ''
    }));
  }

  secretBody(clusterSecret: ClusterMetadata): V1Secret {
    return {
      metadata: {
        name: clusterSecret.secret.name,
        labels: { 'argocd.argoproj.io/secret-type': 'cluster', ...clusterSecret.secret.labels },
        annotations: { [AWS_SECRET_VERSION_KEY]: clusterSecret.version }
      },
      data: {
        name: Buffer.from(clusterSecret.secret.name).toString('base64'),
        server: Buffer.from(clusterSecret.secret.server).toString('base64'),
        config: Buffer.from(JSON.stringify(clusterSecret.secret.config, null, 4)).toString('base64')
      }
    };
  }

  async createSecret(clusterSecret: ClusterMetadata) {
    await this.k8s.createNamespacedSecret(config.argocd.namespace, this.secretBody(clusterSecret));
  }

  async updateSecret(clusterSecret: ClusterMetadata) {
    const body = this.secretBody(clusterSecret);
    try {
      await this.k8s.replaceNamespacedSecret(clusterSecret.secret.name, config.argocd.namespace, body);
    } catch (error) {
      logger.error({ error }, `Failed to update secret: ${clusterSecret.secret.name}`);
    }
  }

  async deleteSecret(secretName: string) {
    await this.k8s.deleteNamespacedSecret(secretName, config.argocd.namespace);
  }
}
