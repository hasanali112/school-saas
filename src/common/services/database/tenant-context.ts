import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Request-scoped tenant context. Opened by the auth middleware once a bearer token is
 * verified, and read by `DatabaseService.tenant()` to set `app.institution_id` for RLS.
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
      'currentInstitutionId() called outside of an authenticated request; ' +
        'the auth middleware must open the tenant context first.',
    );
  }
  return ctx.institutionId;
}
