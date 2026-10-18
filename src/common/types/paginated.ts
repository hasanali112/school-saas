import { PageMeta } from './api-response';

/** Raw page shape returned from repository queries (rows + total). */
export interface Page<T> {
  rows: T[];
  total: number;
}

/** Which page was asked for; `PaginationQueryDto` satisfies it. */
export interface PageRequest {
  page: number;
  limit: number;
}

/** Envelope-shaped page used by services and returned across the wire. */
export interface Paginated<T> {
  items: T[];
  meta: PageMeta;
}

export function paginate<T>(
  items: T[],
  total: number,
  request: PageRequest,
): Paginated<T> {
  return {
    items,
    meta: { total, page: request.page, limit: request.limit },
  };
}

/** Type guard so the response interceptor can detect paginated payloads. */
export function isPaginated<T>(value: unknown): value is Paginated<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as Paginated<T>).items) &&
    typeof (value as Paginated<T>).meta === 'object' &&
    (value as Paginated<T>).meta !== null
  );
}
