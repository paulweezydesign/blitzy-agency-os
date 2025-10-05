import { Injectable } from '@nestjs/common';
import {
  TenantContext,
  TenantContextStore,
} from '@agencyos/context';

export type RequestContext = TenantContext;

@Injectable()
export class TenantContextService {
  private readonly store = new TenantContextStore();

  run<T>(context: RequestContext, callback: () => T): T {
    return this.store.run(context, callback);
  }

  get(): RequestContext {
    return this.store.get();
  }

  setTenant(tenantId?: string) {
    this.store.setTenant(tenantId);
  }

  setUser(userId?: string, roles?: string[]) {
    this.store.setUser(userId, roles);
  }

  merge(partial: Partial<RequestContext>) {
    this.store.merge(partial);
  }
}
