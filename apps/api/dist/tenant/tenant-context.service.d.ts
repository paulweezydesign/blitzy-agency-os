export interface RequestContext {
    tenantId?: string;
    userId?: string;
    roles?: string[];
    requestId?: string;
    [key: string]: unknown;
}
export declare class TenantContextService {
    private readonly storage;
    run<T>(context: RequestContext, callback: () => T): T;
    get(): RequestContext;
    setTenant(tenantId?: string): void;
    setUser(userId?: string, roles?: string[]): void;
    merge(partial: Partial<RequestContext>): void;
}
