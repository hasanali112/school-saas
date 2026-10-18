import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const startedAt = Date.now();

    res.on('finish', () => {
      const elapsedMs = Date.now() - startedAt;
      this.logger.log(
        `${req.method} ${req.path} ${res.statusCode} ${elapsedMs}ms`,
      );
    });

    next();
  }
}
