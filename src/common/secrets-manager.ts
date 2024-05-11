import { SecretsManagerClient, ListSecretsCommand, ListSecretsCommandInput, GetSecretValueCommand, SecretListEntry } from "@aws-sdk/client-secrets-manager";
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator';
import { ClusterSecret } from './interfaces';

import config from '~/config';
import logger from '~/logger';
import { error } from "console";

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
                logger.error(`.. ${name} - contain invalid JSON`)
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

    async getClusterSecrets(): Promise<ClusterSecret[]> {
        const clusters: ClusterSecret[] = []
        const secrets =  await this.getSecrets()
        for (const secret of secrets) {
            const secretValue = await this.getSecretValue(secret);
            if (await this.validateSecret(secret.Name, secretValue)) {
                clusters.push(this.parseSecret(secretValue))
            }
        }
        return clusters
    }
}
