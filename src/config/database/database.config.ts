import { registerAs } from '@nestjs/config';
import { IsString, MinLength } from 'class-validator';
import { validateConfig } from '@common/utils/validate/validate-config';
import { DatabaseConfig } from './database.type';

class DatabaseEnv {
  @IsString()
  @MinLength(1)
  DATABASE_URL: string;
}

export const databaseConfig = registerAs('database', (): DatabaseConfig => {
  const env = validateConfig(DatabaseEnv, process.env);
  return { url: env.DATABASE_URL };
});
