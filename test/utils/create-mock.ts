import type { Abstract, Type } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';

/** Names Nest probes on every provider; answering them with a mock would make Nest call them. */
const NON_MOCKED = new Set<PropertyKey>([
  'then',
  'toJSON',
  'constructor',
  'onModuleInit',
  'onApplicationBootstrap',
  'onModuleDestroy',
  'beforeApplicationShutdown',
  'onApplicationShutdown',
]);

/**
 * A lazy mock: any property read becomes a `jest.fn()` on first access.
 * Pair with `Test.createTestingModule(...).useMocker(createMock)` so a spec lists only
 * the provider under test and every dependency is mocked without naming its methods.
 */
export function createMock<T = unknown>(): jest.Mocked<T> {
  const fns = new Map<PropertyKey, jest.Mock>();
  return new Proxy({} as jest.Mocked<T>, {
    get(_, prop) {
      if (typeof prop === 'symbol' || NON_MOCKED.has(prop)) return undefined;
      let fn = fns.get(prop);
      if (!fn) {
        fn = jest.fn();
        fns.set(prop, fn);
      }
      return fn;
    },
  });
}

/**
 * `moduleRef.get` typed as the mocked shape, so `repo.find.mockResolvedValue(...)` type-checks.
 * Ports are abstract classes, so they are valid tokens here too.
 */
export function getMock<T>(
  moduleRef: TestingModule,
  token: Type<T> | Abstract<T> | symbol | string,
): jest.Mocked<T> {
  return moduleRef.get<T, jest.Mocked<T>>(token);
}
