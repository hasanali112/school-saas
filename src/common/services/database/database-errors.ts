import { QueryFailedError } from 'typeorm';

const UNIQUE_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';

interface WithCode {
  code?: unknown;
  driverError?: unknown;
  cause?: unknown;
}

/** Postgres SQLSTATE of a failed query, looking through TypeORM's wrapper. */
function pgErrorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  if (error instanceof QueryFailedError) return pgErrorCode(error.driverError);
  const candidate = error as WithCode;
  if (typeof candidate.code === 'string') return candidate.code;
  return pgErrorCode(candidate.driverError ?? candidate.cause);
}

export function isUniqueViolation(error: unknown): boolean {
  return pgErrorCode(error) === UNIQUE_VIOLATION;
}

export function isForeignKeyViolation(error: unknown): boolean {
  return pgErrorCode(error) === FOREIGN_KEY_VIOLATION;
}
