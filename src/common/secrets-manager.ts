import { randomUUID } from 'node:crypto';
import { SecretsManagerClient, ListSecretsCommand, ListSecretsCommandInput, GetSecretValueCommand, SecretListEntry } from "@aws-sdk/client-secrets-manager";
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator';
import { ClusterSecret, ClusterMetadata } from './interfaces';

import config from '~/config';
import logger from '~/logger';

const commandParams: ListSecretsCommandInput = {
    IncludePlannedDeletion: false,
    MaxResults: 100,
    Filters: [
        { 
            Key: "name", 
            Values: [config.aws.secrets.path] 
        },
    ]
}

export class SecretManager {

    private client = new SecretsManagerClient({ region: config.aws.region });
    private command = new ListSecretsCommand(commandParams);

    private async getSecrets(): Promise<SecretListEntry[]> {
        logger.info('Scan AWS Secrets Manager')
        const response = await this.client.send(this.command);
        const secrets = response.SecretList ? response.SecretList : [];
        logger.info(`Founded ${secrets.length} secrets`)
        return secrets;
    }


    parseSecret(value: string | undefined): ClusterSecret {
        if (!value) {
            throw new Error('Secret contain invalid value')
        }
        const secretParsed = JSON.parse(value);
        const clusterSecret = plainToInstance(ClusterSecret, secretParsed)
        return clusterSecret
    }

    async validateSecret(name: string | undefined, value: string | undefined): Promise<boolean> {
        try {
            const secret = this.parseSecret(value)
            const errors = await validate(secret)
        
            if (errors.length) {
                logger.error(`.. ${name} - contain invalid value`)
                return false;
            }

        } catch (error) {
            logger.error(`.. ${name}: ${error}`)
            return false;
        }

        logger.info(`.. ${name}`)
        return true;
    }

    private async getSecretValue(secret: SecretListEntry) {
        const command = new GetSecretValueCommand({ SecretId: secret.Name });
        const response = await this.client.send(command);
        const secretValue = response.SecretString;
        return secretValue;
    }

    private getSecretVersion(secret: SecretListEntry): string{
        if (!secret.SecretVersionsToStages) return randomUUID();
        for (const [key, value] of Object.entries(secret.SecretVersionsToStages)) {
            if (value.includes('AWSCURRENT')) return key;
        }
        return randomUUID();
    }

    async getClusterSecrets(): Promise<ClusterMetadata[]> {
        const clusters: ClusterMetadata[] = []
        const secrets =  await this.getSecrets()
        for (const awsSecret of secrets) {
            const awsSecretValue = await this.getSecretValue(awsSecret);
            if (await this.validateSecret(awsSecret.Name, awsSecretValue)) {
                const secret = this.parseSecret(awsSecretValue)
                const version = this.getSecretVersion(awsSecret)
                clusters.push({ secret, version })
            }
        }
        return clusters
    }
}
