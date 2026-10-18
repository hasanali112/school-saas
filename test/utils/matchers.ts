/**
 * Typed adapters over Jest's asymmetric matchers, which are declared as `any`.
 * Keeping the one unavoidable cast here means specs never cast themselves.
 */
export function anyOf<T>(ctor: abstract new (...args: never[]) => T): T {
  return expect.any(ctor) as T;
}

export function containing<T extends object>(partial: Partial<T>): T {
  return expect.objectContaining(partial) as T;
}
