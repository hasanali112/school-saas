import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../types/api-response';
import { isPaginated } from '../types/paginated';

type Enveloped = ApiResponse<unknown> | StreamableFile;

@Injectable()
export class ResponseEnvelopeInterceptor<T> implements NestInterceptor<
  T,
  Enveloped
> {
  intercept(_: ExecutionContext, next: CallHandler<T>): Observable<Enveloped> {
    return next.handle().pipe(map((payload) => this.toEnvelope(payload)));
  }

  private toEnvelope(payload: unknown): Enveloped {
    // Binary downloads (xlsx, pdf) bypass the JSON envelope; Nest streams them as-is.
    if (payload instanceof StreamableFile) return payload;
    if (isPaginated(payload)) {
      return {
        success: true,
        data: payload.items,
        error: null,
        meta: payload.meta,
      };
    }
    return { success: true, data: payload ?? null, error: null };
  }
}
