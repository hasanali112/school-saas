export enum NodeEnv {
  Development = 'development',
  Test = 'test',
  Production = 'production',
}

export interface AppConfig {
  env: NodeEnv;
  port: number;
  isProduction: boolean;
}
