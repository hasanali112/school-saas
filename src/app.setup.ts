import { INestApplication } from '@nestjs/common';
import { ResponseEnvelopeInterceptor } from '@common/interceptors/response-envelope.interceptor';

export const GLOBAL_PREFIX = 'api';

/** Shared by main.ts and the e2e specs so both serve the same HTTP surface. */
export function setupApp<T extends INestApplication>(app: T): T {
  app.setGlobalPrefix(GLOBAL_PREFIX);
  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());
  return app;
}
