import { Expose, Exclude } from 'class-transformer';
import { IsString, IsObject, IsBoolean, IsOptional, IsNotEmpty, IsNotEmptyObject } from 'class-validator';
import { Type } from 'class-transformer';

@Exclude()
export class ClusterSecretClientConfig {
  @Expose()
  @IsBoolean()
  insecure!: boolean;

  @Expose()
  @IsNotEmpty()
  @IsString()
  caData!: string;
}

@Exclude()
export class ClusterSecretConfig {
  @Expose()
  @IsNotEmpty()
  @IsString()
  bearerToken!: string;

  @Expose()
  @IsObject()
  @Type(() => ClusterSecretClientConfig)
  tlsClientConfig!: ClusterSecretClientConfig;
}

@Exclude()
export class ClusterSecret {
  @Expose()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  server!: string;

  @Expose()
  @IsObject()
  @Type(() => ClusterSecretConfig)
  config!: ClusterSecretConfig;

  @Expose()
  @IsOptional()
  @IsObject()
  labels!: Record<string, string>;
}

export interface ClusterMetadata {
  secret: ClusterSecret;
  version: string;
}
