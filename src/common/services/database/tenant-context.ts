import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Request-scoped tenant context. Opened by JwtAuthMiddleware after a valid
 * bearer token is verified and read by repositories that need to scope
 * queries by `institutionId` without threading the value through every call.
 */
export interface TenantContext {
  institutionId: string;
}

const storage = new AsyncLocalStorage<TenantContext>();

export const tenantContext = {
  run<T>(ctx: TenantContext, fn: () => T): T {
    return storage.run(ctx, fn);
  },
  get(): TenantContext | undefined {
    return storage.getStore();
  },
};

export function currentInstitutionId(): string {
  const ctx = storage.getStore();
  if (!ctx) {
    throw new Error(
      'currentInstitutionId() called outside of an authenticated request — ' +
        'JwtAuthMiddleware must run first.',
    );
  }
  return ctx.institutionId;
}
