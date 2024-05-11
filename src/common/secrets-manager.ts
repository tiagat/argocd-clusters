import { SecretsManagerClient, ListSecretsCommand, ListSecretsCommandInput } from "@aws-sdk/client-secrets-manager";
import { ClusterSecret } from './interfaces';

import config from '~/config';

const commandParams: ListSecretsCommandInput = {
    IncludePlannedDeletion: false,
    MaxResults: 1000,
    Filters: [
        { 
            Key: "name", 
            Values: [config.aws.secrets.path] 
        },
    ]
}

export class SecretsManager {

    // private client = new SecretsManagerClient({ region: config.aws.region });
    // private command = new ListSecretsCommand(commandParams);

    public async getSecrets(): Promise<ClusterSecret[]> {
        // const response = await this.client.send(this.command);
        // const secrets =  response.SecretList;
        return []
    }
}
