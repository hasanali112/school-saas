import { registerAs } from '@nestjs/config';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';
import { validateConfig } from '@common/utils/validate/validate-config';
import { HttpConfig } from './http.type';

const MIN_HTTP_TIMEOUT_MS = 100;
const MAX_HTTP_TIMEOUT_MS = 60_000;

/** Outbound HTTP (SMS gateway etc.). */
class HttpEnv {
  @Type(() => Number)
  @IsInt()
  @Min(MIN_HTTP_TIMEOUT_MS)
  @Max(MAX_HTTP_TIMEOUT_MS)
  HTTP_TIMEOUT_MS: number = 5000;
}

export const httpConfig = registerAs('http', (): HttpConfig => {
  const env = validateConfig(HttpEnv, process.env);
  return { timeoutMs: env.HTTP_TIMEOUT_MS };
});
