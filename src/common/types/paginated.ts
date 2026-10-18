import { PageMeta } from './api-response';

/** Raw page shape returned from repository queries (rows + total). */
export interface Page<T> {
  rows: T[];
  total: number;
}

/** Envelope-shaped page used by services and returned across the wire. */
export interface Paginated<T> {
  items: T[];
  meta: PageMeta;
}

/** Build a `Paginated<T>` envelope from a raw repository page. */
export function paginate<T>(
  page: Page<T>,
  query: { page: number; limit: number },
): Paginated<T> {
  return {
    items: page.rows,
    meta: {
      total: page.total,
      page: query.page,
      limit: query.limit,
    },
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
