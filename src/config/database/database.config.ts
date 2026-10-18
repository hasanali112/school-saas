import { registerAs } from '@nestjs/config';
import { IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { validateConfig } from '@common/utils/validate/validate-config';
import { DatabaseConfig } from './database.type';

/** A plain Postgres identifier, so the role can be inlined into `SET LOCAL ROLE`. */
const ROLE_PATTERN = /^[a-z_][a-z0-9_]{0,62}$/;

class DatabaseEnv {
  @IsString()
  @MinLength(1)
  DATABASE_URL: string;

  @IsOptional()
  @Matches(ROLE_PATTERN, {
    message: 'DATABASE_SYSTEM_ROLE must be a lower-case Postgres identifier',
  })
  DATABASE_SYSTEM_ROLE: string = 'edusmart_system';
}

export const databaseConfig = registerAs('database', (): DatabaseConfig => {
  const env = validateConfig(DatabaseEnv, process.env);
  return { url: env.DATABASE_URL, systemRole: env.DATABASE_SYSTEM_ROLE };
});
