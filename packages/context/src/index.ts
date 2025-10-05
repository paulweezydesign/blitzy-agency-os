import { AsyncLocalStorage } from 'node:async_hooks';

export interface TenantContext {
  tenantId?: string;
  userId?: string;
  roles?: string[];
  requestId?: string;
  [key: string]: unknown;
}

export class TenantContextStore {
  private readonly storage = new AsyncLocalStorage<TenantContext>();

  run<T>(context: TenantContext, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  get(): TenantContext {
    return this.storage.getStore() ?? {};
  }

  merge(partial: Partial<TenantContext>) {
    const store = this.storage.getStore();
    if (store) {
      Object.assign(store, partial);
    }
  }

  setTenant(tenantId?: string) {
    this.merge({ tenantId });
  }

  setUser(userId?: string, roles?: string[]) {
    this.merge({ userId, roles });
  }
}
