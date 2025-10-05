"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantContextService = void 0;
const common_1 = require("@nestjs/common");
const node_async_hooks_1 = require("node:async_hooks");
let TenantContextService = class TenantContextService {
    storage = new node_async_hooks_1.AsyncLocalStorage();
    run(context, callback) {
        return this.storage.run(context, callback);
    }
    get() {
        return this.storage.getStore() ?? {};
    }
    setTenant(tenantId) {
        const store = this.storage.getStore();
        if (store) {
            store.tenantId = tenantId;
        }
    }
    setUser(userId, roles) {
        const store = this.storage.getStore();
        if (store) {
            store.userId = userId;
            store.roles = roles;
        }
    }
    merge(partial) {
        const store = this.storage.getStore();
        if (store) {
            Object.assign(store, partial);
        }
    }
};
exports.TenantContextService = TenantContextService;
exports.TenantContextService = TenantContextService = __decorate([
    (0, common_1.Injectable)()
], TenantContextService);
//# sourceMappingURL=tenant-context.service.js.map