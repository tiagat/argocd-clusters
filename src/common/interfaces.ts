import { Expose, Exclude } from 'class-transformer'
import { IsString, IsObject, IsBoolean, IsDefined } from 'class-validator'
import { Type } from 'class-transformer'


@Exclude()
export class ClusterSecretClientConfig {
    @Expose() @IsDefined() @IsBoolean()
    insecure!: boolean;
    
    @Expose() @IsDefined() @IsString()
    caData!: string;
}

@Exclude()
export class ClusterSecretConfig {
    @Expose() @IsDefined() @IsString()
    bearerToken!: string;
    
    @Expose() @IsDefined() @IsObject() @Type(() => ClusterSecretClientConfig)
    tlsClientConfig!: ClusterSecretClientConfig;
}

@Exclude()
export class ClusterSecret {
    @Expose()  @IsDefined() @IsString()
    name!: string;
    
    @Expose()  @IsDefined() @IsString()
    server!: string;
    
    @Expose() @IsDefined() @IsObject() @Type(() => ClusterSecretConfig)
    config!: ClusterSecretConfig;

}


export interface ClusterMetadata {
    secret: ClusterSecret;
    version: string;
}
