import { TenantContext } from '@agencyos/context';
export type RequestContext = TenantContext;
export declare class TenantContextService {
    private readonly store;
    run<T>(context: RequestContext, callback: () => T): T;
    get(): RequestContext;
    setTenant(tenantId?: string): void;
    setUser(userId?: string, roles?: string[]): void;
    merge(partial: Partial<RequestContext>): void;
}
