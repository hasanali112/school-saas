import { registerAs } from '@nestjs/config';
import { Type } from 'class-transformer';
import { IsEnum, IsInt } from 'class-validator';
import { validateConfig } from '@common/utils/validate/validate-config';
import { AppConfig, NodeEnv } from './app.type';

class AppEnv {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @Type(() => Number)
  @IsInt()
  PORT: number;
}

export const appConfig = registerAs(
  'app',
  (): AppConfig => {
    const env = validateConfig(AppEnv, process.env);
    return {
      env: env.NODE_ENV,
      port: env.PORT,
      isProduction: env.NODE_ENV === NodeEnv.Production,
    };
  },
);
