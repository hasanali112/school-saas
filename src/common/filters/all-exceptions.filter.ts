import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ApiError, ApiResponse } from '../types/api-response';

export const VALIDATION_ERROR = 'VALIDATION_ERROR';
const INTERNAL_MESSAGE = 'Internal server error';

/** What `HttpException#getResponse()` holds when it is an object. */
interface HttpErrorBody {
  message?: string | string[];
}

/** Every error leaves as the envelope: `{ success: false, data: null, error: { code, message } }`. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    if (!(exception instanceof HttpException)) {
      this.logger.error(
        'Unhandled error',
        exception instanceof Error ? exception.stack : String(exception),
      );
    }
    const body: ApiResponse<null> = {
      success: false,
      data: null,
      error: this.toError(exception, status),
    };
    httpAdapter.reply(ctx.getResponse(), body, status);
  }

  private toError(exception: unknown, status: number): ApiError {
    const code = HttpStatus[status] ?? String(status);
    if (!(exception instanceof HttpException))
      return { code, message: INTERNAL_MESSAGE };

    const response = exception.getResponse();
    if (typeof response === 'string') return { code, message: response };
    const { message } = response as HttpErrorBody;
    // ValidationPipe reports every failed constraint as an array of messages.
    if (Array.isArray(message))
      return {
        code: VALIDATION_ERROR,
        message: 'Validation failed',
        details: message,
      };
    return { code, message: message ?? exception.message };
  }
}
