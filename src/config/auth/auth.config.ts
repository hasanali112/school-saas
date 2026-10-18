import { registerAs } from '@nestjs/config';
import { IsString, MinLength } from 'class-validator';
import { validateConfig } from '@common/utils/validate/validate-config';
import { AuthConfig } from './auth.type';

const MIN_JWT_SECRET_LENGTH = 32;

class AuthEnv {
  @IsString()
  @MinLength(MIN_JWT_SECRET_LENGTH)
  JWT_SECRET: string;
}

export const authConfig = registerAs('auth', (): AuthConfig => {
  const env = validateConfig(AuthEnv, process.env);
  return { jwtSecret: env.JWT_SECRET };
});
