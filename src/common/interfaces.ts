export class ClusterSecret {
    name!: string;
    server!: string;
    config!: {
        bearerToken: string;
        tlsClientConfig: {
            insecure: boolean;
            caData: string;
        }
    }
}
