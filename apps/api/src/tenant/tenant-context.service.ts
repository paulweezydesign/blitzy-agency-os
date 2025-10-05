import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContext {
  tenantId?: string;
  userId?: string;
  roles?: string[];
  requestId?: string;
  [key: string]: unknown;
}

@Injectable()
export class TenantContextService {
  private readonly storage = new AsyncLocalStorage<RequestContext>();

  run<T>(context: RequestContext, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  get(): RequestContext {
    return this.storage.getStore() ?? {};
  }

  setTenant(tenantId?: string) {
    const store = this.storage.getStore();
    if (store) {
      store.tenantId = tenantId;
    }
  }

  setUser(userId?: string, roles?: string[]) {
    const store = this.storage.getStore();
    if (store) {
      store.userId = userId;
      store.roles = roles;
    }
  }

  merge(partial: Partial<RequestContext>) {
    const store = this.storage.getStore();
    if (store) {
      Object.assign(store, partial);
    }
  }
}
