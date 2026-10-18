import { DatabaseError } from 'pg';
import { QueryFailedError } from 'typeorm';

export const UNIQUE_VIOLATION = '23505';
export const FOREIGN_KEY_VIOLATION = '23503';

/** What TypeORM throws when Postgres rejects a statement with the given SQLSTATE. */
export function pgError(code: string): QueryFailedError<DatabaseError> {
  const driverError = new DatabaseError('rejected', 0, 'error');
  driverError.code = code;
  return new QueryFailedError('query', [], driverError);
}
