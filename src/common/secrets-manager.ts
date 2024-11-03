import { GetSecretValueCommand, ListSecretsCommand, ListSecretsCommandInput, SecretListEntry, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ClusterMetadata, ClusterSecret } from './interfaces';

import config from '~/config';
import logger from '~/logger';

const commandParams: ListSecretsCommandInput = {
  IncludePlannedDeletion: false,
  MaxResults: 100,
  Filters: [
    {
      Key: 'name',
      Values: [config.aws.secrets.prefix],
    },
  ],
};

export class SecretManager {
  private client = new SecretsManagerClient({ region: config.aws.region, maxAttempts: 3 });
  private command = new ListSecretsCommand(commandParams);

  private getSecretVersion(secret: SecretListEntry): string | null {
    if (!secret.SecretVersionsToStages) return null;
    for (const [key, value] of Object.entries(secret.SecretVersionsToStages)) {
      if (value.includes('AWSCURRENT')) return key;
    }
    return null;
  }

  private async getAwsSecrets(): Promise<SecretListEntry[]> {
    logger.info('Scan AWS Secrets Manager');
    const response = await this.client.send(this.command);
    return response.SecretList ? response.SecretList : [];
  }

  private async getClustersSecrets(awsSecretsList: SecretListEntry[]): Promise<ClusterMetadata[]> {
    const clusterSecrets: ClusterMetadata[] = [];

    for (const awsSecret of awsSecretsList) {
      const version = this.getSecretVersion(awsSecret);
      if (!version) continue;

      const secret = await this.parseSecret(awsSecret);
      if (!secret) continue;

      clusterSecrets.push({ secret, version });
    }

    return clusterSecrets;
  }

  async parseSecret(awsSecret: SecretListEntry): Promise<ClusterSecret | null> {
    const value = await this.getSecretValue(awsSecret);

    if (!value) {
      logger.error('Secret contain invalid value');
      return null;
    }

    try {
      const secretParsed = JSON.parse(value);
      const clusterSecret = plainToInstance(ClusterSecret, secretParsed);

      const validation = await this.validateSecret(awsSecret, clusterSecret);
      if (!validation) return null;

      return clusterSecret;
    } catch (error) {
      logger.error(`${error}`);
    }

    return null;
  }

  async validateSecret(awsSecret: SecretListEntry, clusterSecret: ClusterSecret): Promise<boolean> {
    const errors = await validate(clusterSecret);
    if (errors.length) {
      logger.error(`.. ${awsSecret.Name} - contain invalid value`);
      return false;
    }
    logger.info(`.. ${awsSecret.Name}`);
    return true;
  }

  private async getSecretValue(secret: SecretListEntry) {
    const command = new GetSecretValueCommand({ SecretId: secret.Name });
    const response = await this.client.send(command);
    return response.SecretString;
  }

  async scanStoredSecrets(): Promise<ClusterMetadata[]> {
    const secrets = await this.getAwsSecrets();
    return await this.getClustersSecrets(secrets);
  }
}
